namespace Compiler
{
    public class Grouper
    {
        private List<Token> _tokens;
        private int _length;
        private bool _inContext;
        private int _index;
        private ErrorSink _errorSink;
        private Stack<Token> _indents = new Stack<Token>();
        private Token Current => this._tokens[this._index];
        private Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);
        public List<Token> Tokens = new();

        public Grouper(List<Token> tokens, ErrorSink errorSink)
        {
            this._tokens = tokens;
            this._length = tokens.Count;
            this._inContext = false;
            this._index = 0;
            this._errorSink = errorSink;
        }

        public List<Token> Group()
        {
            var tokens = new List<Token>();
            var annotations = new List<Token>();
            
            while (_index < _length)
            {
                if (Current == TokenType.KWComponent ||
                    Current == TokenType.KWSystem ||
                    Current == TokenType.KWType ||
                    Current == TokenType.KWEndpoint ||
                    Current == TokenType.KWLet ||
                    Current == TokenType.KWRecord ||
                    Current == TokenType.KWData ||
                    Current == TokenType.KWChoice ||
                    Current == TokenType.KWFlow)
                {
                    _inContext = true;
                    tokens.Add(Token.START_CONTEXT);
                    tokens.Add(Current);
                    // the annotations come after the keyword because the parser
                    // checks the keyword before going into the specific sub-parser
                    tokens.AddRange(annotations);
                    annotations = new List<Token>();
                    _index++;
                }
                else if (!_inContext && Current == TokenType.NEWLINE && Next == TokenType.At)
                {
                    // parse annotation
                    var annotationToken = Current.Clone();
                    _index++;
                    while (Current != TokenType.NEWLINE)
                    {
                        annotationToken.Append(Current);
                        _index++;
                    }

                    annotationToken.Type = TokenType.Annotation;
                    annotations.Add(annotationToken);
                }
                else if (_inContext && Current == TokenType.At)
                {
                    // parse annotation
                    var annotationToken = Current.Clone();
                    _index++;
                    while (Current != TokenType.NEWLINE)
                    {
                        annotationToken.Append(Current);
                        _index++;
                    }

                    annotationToken.Type = TokenType.Annotation;
                    tokens.Add(annotationToken);
                }
                else if (_inContext && Current == TokenType.Minus && Next == TokenType.GreaterThen)
                {
                    var nextToken = Current.Clone();
                    _index++;
                    nextToken.Append(Current);
                    nextToken.Type = TokenType.Next;
                    tokens.Add(nextToken);
                    _index++;
                }
                else if (_inContext && Current == TokenType.INDENT)
                {
                    tokens.Add(Token.START);
                    _indents.Push(Current);
                    _index++; // skip INDENT
                }
                else if (_inContext && Current == TokenType.NEWLINE && Next == TokenType.SAMEDENT)
                {
                    _index++; // skip the newline, not needed
                    _index++; // skip SAMEDENT

                    if (tokens.LastOrDefault() != TokenType.Annotation)
                    {
                        tokens.Add(Token.END);
                        tokens.Add(Token.START);
                    }
                }
                else if (_inContext && Current == TokenType.NEWLINE && Next == TokenType.DEDENT)
                {
                    _index++; // skip newline
                    _index++; // skip dedent

                    _indents.Pop();
                    tokens.Add(Token.END);
                    if (_indents.Count == 0) 
                    {
                        _inContext = false;
                        tokens.Add(Token.STOP_CONTEXT);
                    }
                    else
                    {
                        tokens.Add(Token.END);
                        tokens.Add(Token.START);
                    }
                }
                else if (_inContext && Current == TokenType.Word && Current.Value == "extends")
                {
                    Current.Type = TokenType.KWExtends;
                    tokens.Add(Current);
                    _index++;
                }
                else if (_inContext && Current == TokenType.Word && Current.Value == "if")
                {
                    Current.Type = TokenType.KWIf;
                    tokens.Add(Current);
                    _index++;
                }
                else if (_inContext && Current == TokenType.Word && Current.Value == "else")
                {
                    Current.Type = TokenType.KWElse;
                    tokens.Add(Current);
                    _index++;
                }
                else if (_inContext && Current == TokenType.DoubleQuote)
                {
                    _index++; // skip the double quote symbol 
                    var stringToken = Current.Clone();
                    _index++;
                    while (Current != TokenType.DoubleQuote)
                    {
                        stringToken.Append(Current);
                        _index++;
                    }
                    _index++; // skip the closing double quote symbol
                    stringToken.Type = TokenType.String;
                    tokens.Add(stringToken);
                }
                else if (Current == TokenType.EOF)
                {
                    _index++;
                }
                else
                {
                    tokens.Add(Current);
                    _index++;
                }
                
                
            }

            while (_indents.Count > 0)
            {
                tokens.Add(Token.END);
                _indents.Pop();
            }
            if (_inContext) tokens.Add(Token.STOP_CONTEXT);
            tokens.Add(Token.EOF);
            this.Tokens = tokens;
            return tokens;
        }
    }
}
