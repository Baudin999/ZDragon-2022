using System.Runtime.CompilerServices;
using Compiler.Resolvers;

[assembly:InternalsVisibleTo("Compiler.Tests")]
namespace Compiler
{
    public class ZDragon
    {
        private readonly string _basePath;
        private readonly string _outputPath;
        
        public Lexer? Lexer { get; private set; }
        private Grouper? Grouper { get; set; }
        private Parser? Parser { get; set; }
        public List<AstNode> Nodes => Module.Nodes;

        private ErrorSink _errorSink = new ErrorSink();
        public List<Error> Errors => _errorSink.Errors;
        public List<NodeReference> References { get; } = new();

        private readonly IResolver _resolver;
        public IModule Module { get; set; }
        public List<IModule> ResolvedModules { get; set; } = new List<IModule>();

        public IAttributesNode? Get(string id)
        {
            var result = Nodes
                .OfType<IAttributesNode>()
                .FirstOrDefault(n => n.Id == id);
            
            if (result is null)
            {
                foreach (var module in ResolvedModules)
                {
                    result = module.Nodes
                        .OfType<IAttributesNode>()
                        .FirstOrDefault(n => n.Id == id);
                    if (result is not null) break;
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
            Module = new TextModule("", "");
            _resolver = resolver;
        }

        public ZDragon()
        {
            // empty constructor for testing
            _basePath = "";
            _outputPath = "";
            Module = new TextModule("", "");
            _resolver = new ManualResolver(new Dictionary<string, string>());
        }
        
        public ZDragon(IResolver resolver)
        {
            // empty constructor for testing
            _basePath = "";
            _outputPath = "";
            Module = new TextModule("", "");
            _resolver = resolver;
        }

        public ZDragon Compile(string code)
        {
            // create the module
            var module = new TextModule("test", code);
            return Compile(module);
        }
    

        public ZDragon Compile(IModule module)
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
                var resolvedModule = _resolver.Resolve(ns);
                this.ResolvedModules.Add(resolvedModule);
            }
            
            // parse the code
            Parser = new Parser(groupedTokens, _errorSink, References);
            Module.Nodes = Parser.Parse();
            
            // type-check the nodes in the module
            var typeChecker = new TypeChecker(this);
            var errors = typeChecker.Check(); // type-check errors

            return this;
        }

        
    }
}
