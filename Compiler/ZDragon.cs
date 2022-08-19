namespace Compiler
{
    public class ZDragon
    {
        public Lexer? Lexer { get; private set; }
        private Grouper? Grouper { get; set; }
        private Parser? Parser { get; set; }
        public List<AstNode> Nodes { get; private set; } = new List<AstNode>();

        private ErrorSink _errorSink = new ErrorSink();
        public List<Error> Errors => _errorSink.Errors;

        public ZDragon Compile(string code)
        {
            _errorSink = new ErrorSink();

            Lexer = new Lexer(code, _errorSink);
            var lexedTokens = Lexer.Lex();
            Grouper = new Grouper(lexedTokens, _errorSink);
            var groupedTokens = Grouper.Group();
            Parser = new Parser(groupedTokens, _errorSink);
            var nodes = Parser.Parse();


            this.Nodes = nodes;

            return this;
        }
    }
}
