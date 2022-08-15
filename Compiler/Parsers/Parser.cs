namespace Compiler.Parsers
{
    public partial class Parser
    {
        private readonly List<Token> _tokens;
        private int _index;
        private readonly ErrorSink _errorSink;

        private Token Current => this._tokens[this._index];
        private Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);

        public List<AstNode> Nodes { get; private set; }

        private void Abort(string message)
        {
            _errorSink.Errors.Add(new Error(Current, message));
            _ = TakeWhile(() => If(TokenType.STOP_CONTEXT)).ToList();
        }
        
        private Token Take() {
            Token current = this._tokens[this._index];
            _index++;
            return current;
        }

        private Token Take(TokenType type, string message)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) Take();

            if (Current != type)
            {
                Abort(message);
            }
            return Take();
        }

        private Token Take(TokenType type)
        {
            return Take(type, @$"Expected '{type}' but received a '{Current.Type}'.");
        }
        private IEnumerable<Token> TakeWhile(TokenType type)
        {
            // Take the tokens if they are of the TokenType type, but
            // skip the NEWLINEs and SPACEs
            while (If(type))
                yield return Take(type);
        }
        private IEnumerable<Token> TakeWhile(Func<bool> predicate)
        {
            while(predicate())
            {
                yield return Take();
            }
        }

        private bool If(TokenType type)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) Take();
            return Current == type;
        }

        private void If(TokenType type, Action parse)
        {
            if (If(type))
                parse();
        }

        public Parser(List<Token> tokens, ErrorSink errorSink)
        {
            this._tokens = tokens;
            this._index = 0;
            this._errorSink = errorSink;
            this.Nodes = new List<AstNode>();
        }

        public List<AstNode> Parse()
        {
            Nodes = new List<AstNode>();

            while (_index < this._tokens.Count)
            {
                if (Current == TokenType.KWComponent)
                {
                    var componentNode = parseComponent();
                    if (componentNode is not null)
                        Nodes.Add(componentNode);
                }
                else if (Current == TokenType.KWType)
                {
                    var typeDefinitionNode = parseTypeDefinition();
                    if (typeDefinitionNode is not null)
                        Nodes.Add(typeDefinitionNode);
                }
                else
                {
                    Take();
                }
            }

            return Nodes;
        }

        
    }
}
