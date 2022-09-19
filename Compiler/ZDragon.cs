using System.Runtime.CompilerServices;
using Compiler.Resolvers;
using Compiler.Transpilers;

[assembly:InternalsVisibleTo("Compiler.Tests")]
namespace Compiler
{
    public class ZDragon : IDisposable
    {
        private readonly string _basePath;
        private readonly string _outputPath;
        private readonly string _binPath;
        
        public Lexer? Lexer { get; private set; }
        private Grouper? Grouper { get; set; }
        private Parser? Parser { get; set; }
        public List<AstNode> Nodes => Module.Nodes;
        public List<AstNode> Imports = new List<AstNode>();
        public List<AstNode> AllNodes => Nodes.Concat(Imports).ToList();

        private ErrorSink _errorSink = new ErrorSink();
        public List<Error> Errors => _errorSink.Errors;
        public List<NodeReference> References { get; } = new();

        private readonly IResolver _resolver;
        public IModule Module { get; set; }
        public List<IModule> ResolvedModules { get; set; } = new List<IModule>();

        public IAttributesNode? Get(string id)
        {
            var result = (Nodes.Concat(Imports))
                .OfType<IAttributesNode>()
                .FirstOrDefault(n => n.Id == id);
            
            if (result is null)
            {
                foreach (var module in ResolvedModules)
                {
                    result = module.Nodes
                        .OfType<IAttributesNode>()
                        .FirstOrDefault(n => n.Id == id);
                    if (result is not null)
                    {
                        if (result is AstNode astNode)
                        {
                            if (astNode.Namespace == "")
                                astNode.Namespace = module.Namespace;
                            Imports.Add(astNode);
                        }
                        break;
                    }
                }
            }

            return result;
        }

        public T? Get<T>(string id) where T: IAttributesNode
        { var result = Get(id);
            return result is not null ? (T)result : default(T);
        }

        public ZDragon(string basePath, IResolver resolver)
        {
            _basePath = basePath;
            _outputPath = Path.Combine(basePath, ".out");
            _binPath = Path.Combine(basePath, ".bin");

            if (!Directory.Exists(_basePath))
                Directory.CreateDirectory(_basePath);
            if (!Directory.Exists(_outputPath))
                Directory.CreateDirectory(_outputPath);
            
            Module = new TextModule("", "");
            _resolver = resolver;
        }

        public ZDragon()
        {
            // empty constructor for testing
            _basePath = "";
            _outputPath = "";
            _binPath = "";
            Module = new TextModule("", "");
            _resolver = new ManualResolver(new Dictionary<string, string>());
        }
        
        public ZDragon(IResolver resolver)
        {
            // empty constructor for testing
            _basePath = "";
            _outputPath = "";
            _binPath = "";
            Module = new TextModule("", "");
            _resolver = resolver;
        }

        public async Task<ZDragon> Compile(string code)
        {
            // create the module
            var module = new TextModule("test", code);
            return await Compile(module);
        }
    

        public async Task<ZDragon> Compile(IModule module)
        {
            Module = module;

            _errorSink = new ErrorSink();

            // lex the tokens from the input
            Lexer = new Lexer(module.Text, _errorSink);
            var lexedTokens = Lexer.Lex();

            // group the tokens in lexical context
            Grouper = new Grouper(lexedTokens, _errorSink);
            var groupedTokens = Grouper.Group();

            // resolve all the open statements
            foreach (var ns in Grouper.OpenNamespaces)
            {
                // import the namespace and resolve the IModule
                var resolvedModule = await _resolver.Resolve(ns);
                this.ResolvedModules.Add(resolvedModule);
            }

            // parse the code
            Parser = new Parser(groupedTokens, _errorSink, References);
            Module.Nodes = Parser.Parse(module.Namespace);

            // Extend and Merge nodes
            MergeExtensions(module);

            // type-check the nodes in the module
            var typeChecker = new TypeChecker(this);
            var errors = typeChecker.Check(); // type-check errors

            return this;
        }

        public async Task MainPage()
        {
            var html = new HtmlTranspiler().Run(this.AllNodes);
            var path = Path.Combine(_outputPath, Module.Namespace, "index.html");
            await FileHelpers.SaveFileAsync(path, html);
        }

        public async Task ComponentDiagram()
        {
            var plantuml = new ArchitectureTranspiler().Run(this.AllNodes);
            var bytes = await TranspilationService.ToSvg(plantuml);
            var path = Path.Combine(_outputPath, Module.Namespace, "components.svg");
            await FileHelpers.SaveFileAsync(path, bytes);
        }
        
        public async Task SaveNodes()
        {
            var path = Path.Join(_binPath, Module.Namespace + ".nodes.json");
            await FileHelpers.SaveObjectAsync(path, this.AllNodes);
        }
        
        public async Task SaveReferences()
        {
            var path = Path.Join(_binPath, Module.Namespace + ".refs.json");
            await FileHelpers.SaveObjectAsync(path, this.References);
        }

        private void MergeExtensions(IModule module)
        {
            foreach (var node in module.Nodes.OfType<AttributesNode<ComponentAttribute>>())
            {
                foreach (var extends in node.Extensions)
                {
                    var extendedNode = Get(extends);
                    if (extendedNode is not null && extendedNode is AttributesNode<ComponentAttribute> atn)
                    {
                        foreach (var attribute in atn.Attributes)
                        {
                            if (!node.ContainsAttribute(attribute.Id))
                                node.Attributes.Add(attribute.Clone());
                        }
                    }
                }
            }
        }

        public void Dispose()
        {
            foreach (var module in ResolvedModules)
            {
                module.Dispose();
            }

            Module.Dispose();
            _resolver?.Dispose();
        }

        
    }
}
