namespace Compiler
{
    public class ZDragon
    {
        public Lexer? lexer { get; private set; }
        public Grouper? grouper { get; private set; }
        public Parser? parser { get; private set; }
        public List<AstNode> Nodes { get; private set; } = new List<AstNode>();

        private ErrorSink errorSink = new ErrorSink();
        public List<Error> Errors => errorSink.Errors;

        public ZDragon Compile(string code)
        {
            errorSink = new ErrorSink();

            lexer = new Lexer(code, errorSink);
            var lexedTokens = lexer.Lex();
            grouper = new Grouper(lexedTokens, errorSink);
            var groupedTokens = grouper.Group();
            parser = new Parser(groupedTokens, errorSink);
            var nodes = parser.Parse();


            this.Nodes = nodes;

            return this;
        }
    }
}
