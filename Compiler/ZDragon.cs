namespace Compiler
{
    public class ZDragon
    {
        public Lexer? Lexer { get; private set; }
        private Grouper? Grouper { get; set; }
        private Parser? Parser { get; set; }
        public List<AstNode> Nodes { get; private set; } = new();

        private ErrorSink _errorSink = new ErrorSink();
        public List<Error> Errors => _errorSink.Errors;
        public List<NodeReference> References { get; } = new();

        public IAttributesNode? Get(string id)
        {
            return Nodes
                .OfType<IAttributesNode>()
                .FirstOrDefault(n => n.Id == id);
        }

        public T? Get<T>(string id) where T: IAttributesNode
        {
            var result = Nodes
                .OfType<IAttributesNode>()
                .FirstOrDefault(n => n.Id == id);

            return result is not null ? (T)result : default(T);
        }
    

        public ZDragon Compile(string code)
        {
            _errorSink = new ErrorSink();

            Lexer = new Lexer(code, _errorSink);
            var lexedTokens = Lexer.Lex();
            Grouper = new Grouper(lexedTokens, _errorSink);
            var groupedTokens = Grouper.Group();
            Parser = new Parser(groupedTokens, _errorSink, References);
            var nodes = Parser.Parse();
            
            this.Nodes = nodes;


            var typeChecker = new TypeChecker(this);
            var errors = typeChecker.Check();

            return this;
        }
    }
}
