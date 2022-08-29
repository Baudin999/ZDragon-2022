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
        private Token? Peek (int offSet) => this._tokens.ElementAtOrDefault(this._index + offSet);
        public List<Token> Tokens = new();
        public List<string> OpenNamespaces = new List<string>();
        
        private Token Take()
        {
            var token = this.Current;
            this._index++;
            return token;
        }

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
                else if (Current == TokenType.KWOpen)
                {
                    _inContext = true;
                    tokens.Add(Token.START_CONTEXT);
                    tokens.Add(Take());
                    
                    string open = "";
                    while (Current != TokenType.NEWLINE)
                    {
                        if (Current == TokenType.Word || Current == TokenType.Dot)
                        {
                            open += Current.Value;
                        }
                        tokens.Add(Take());
                    }
                    OpenNamespaces.Add(open);
                    tokens.Add(Token.STOP_CONTEXT);
                    _inContext = false;
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
                    
                    // take the newline after the annotation
                    _index++;

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
                else if (_inContext && Current == TokenType.SAMEDENT)
                {
                    _index++; // skip SAMEDENT

                    if (tokens.LastOrDefault() != TokenType.Annotation)
                    {
                        tokens.Add(Token.END);
                        tokens.Add(Token.START);
                    }
                }
                else if (_inContext && Current == TokenType.DEDENT)
                {
                    tokens.Add(Token.END);
                    while (Current == TokenType.DEDENT)
                    {
                        tokens.Add(Token.END);
                        _indents.Pop();
                        _index++;
                    }

                    if (_indents.Count == 0)
                    {
                        tokens.Add(Token.STOP_CONTEXT);
                    }
                    else
                    {
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
