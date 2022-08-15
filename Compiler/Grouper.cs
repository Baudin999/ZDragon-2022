namespace Compiler
{
    public class Grouper
    {
        private List<Token> _tokens;
        private int _length;
        private bool _inContext;
        private int _index;
        private Stack<Token> _indents = new Stack<Token>();
        private Token Current => this._tokens[this._index];
        private Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);

        public Grouper(List<Token> tokens)
        {
            this._tokens = tokens;
            this._length = tokens.Count;
            this._inContext = false;
            this._index = 0;
        }

        public List<Token> Group()
        {
            var tokens = new List<Token>();
            
            while (_index < _length)
            {
                if (Current == TokenType.KWComponent ||
                    Current == TokenType.KWLet)
                {
                    _inContext = true;
                    tokens.Add(Token.START_CONTEXT());
                }
                else if (_inContext && Current == TokenType.INDENT)
                {
                    tokens.Add(Token.START());
                    _indents.Push(Current);
                    _index++; // skip INDENT
                }
                else if (_inContext && Current == TokenType.NEWLINE && Next == TokenType.SAMEDENT)
                {
                    _index++; // skip the newline, not needed
                    _index++; // skip SAMEDENT

                    tokens.Add(Token.END());
                    tokens.Add(Token.START());
                }
                else if (_inContext && Current == TokenType.NEWLINE && Next == TokenType.DEDENT)
                {
                    _index++; // skip newline
                    _index++; // skip dedent

                    _indents.Pop();
                    tokens.Add(Token.END());
                    if (_indents.Count == 0) 
                    {
                        _inContext = false;
                        tokens.Add(Token.STOP_CONTEXT());
                    }
                    else
                    {
                        tokens.Add(Token.END());
                        tokens.Add(Token.START());
                    }
                }


                tokens.Add(Current);
                _index++;
            }

            while (_indents.Count > 0)
            {
                tokens.Add(Token.END());
                _indents.Pop();
            }
            if (_inContext) tokens.Add(Token.STOP_CONTEXT());
            return tokens;
        }
    }
}
