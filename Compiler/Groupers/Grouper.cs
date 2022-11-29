namespace Compiler.Groupers
{
    public partial class Grouper : TokenIterator
    {
        private bool _inContext;
        private int _indentDepth;

        public List<Token> Tokens { get; private set; } = new List<Token>();
        public List<string> OpenNamespaces = new List<string>();
        private List<Token> tokens = new List<Token>();
        private List<Token> annotations = new List<Token>();

        public Grouper(List<Token> tokens, ErrorSink errorSink) : base(tokens, errorSink)
        {
            this._inContext = false;
            this._indentDepth = 2;
            this._index = 0;
        }

        private Token Append(TokenKind kind)
        {
            var token = Take(kind);
            tokens.Add(token);
            return token;
        }

        /// <summary>
        /// Remove all unnecessary tokens from the stream:
        ///  - SPACE
        ///  - NEWLINE
        ///  - INDENT
        ///  - DEDENT
        ///  - SAMEDENT
        /// </summary>
        private void Reduce(bool allowSpaces = false)
        {
            if (allowSpaces)
            {
                while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE || Current == TokenKind.INDENT ||
                       Current == TokenKind.DEDENT || Current == TokenKind.SAMEDENT || Current == TokenKind.ROOT)
                {
                    if (Current == TokenKind.EOF) break;
                    _index++;
                }
            }
            else
            {
                while (Current == TokenKind.NEWLINE || Current == TokenKind.INDENT ||
                       Current == TokenKind.DEDENT || Current == TokenKind.SAMEDENT || Current == TokenKind.ROOT)
                {
                    if (Current == TokenKind.EOF) break;
                    _index++;
                }
            }
        }
        

        public List<Token> Group()
        {
            if (_tokens.Count == 1 && _tokens[0] == TokenKind.EOF) return new List<Token>();
            
            tokens = new List<Token>();
            annotations = new List<Token>();

            Stack<Token> _indents = new();
            
            while (_index < _max)
            {
                if (Current == TokenKind.KWComponent || 
                    Current == TokenKind.KWSystem)
                {
                    GroupComponent();
                }
                else if (Current == TokenKind.KWEndpoint)
                {
                    GroupEndpoint();
                }
                else if (Current == TokenKind.KWView)
                {
                    GroupView();
                }
                else if (Current == TokenKind.KWType ||
                         Current == TokenKind.KWLet ||
                         Current == TokenKind.KWRecord ||
                         Current == TokenKind.KWData ||
                         Current == TokenKind.KWChoice ||
                         Current == TokenKind.KWFlow)
                {
                    _inContext = true;
                    
                    // indent depth is when we stop wrapping "SAMEDENT" tokens
                    // with a START and END tag.
                    _indentDepth = 2;
                    if (Current == TokenKind.KWView) _indentDepth = 3;
                    if (Current == TokenKind.KWFlow) _indentDepth = 30;
                    tokens.Add(Token.START_CONTEXT);
                    tokens.Add(Current);
                    // the annotations come after the keyword because the parser
                    // checks the keyword before going into the specific sub-parser
                    tokens.AddRange(annotations);
                    annotations = new List<Token>();
                    _index++;
                }
                else if (Current == TokenKind.KWChapter)
                {
                    GroupChapter();
                }
                else if (Current == TokenKind.KWParagraph)
                {
                    GroupParagraph();
                }
                else if (Current == TokenKind.KWOpen)
                {
                    GroupOpen();
                }
                else if (Current == TokenKind.NEWLINE && Next == TokenKind.At)
                {
                    // GROUP THE ANNOTATION
                    _inContext = false;
                    
                    TakeCurrent(); // take the newline
                    var annotation = TakeWhileNot(TokenKind.NEWLINE).Merge(TokenKind.Annotation);
                    if (annotation is not null)
                        annotations.Add(annotation);
                }
                else if (_inContext && Current == TokenKind.At)
                {
                    // parse annotation
                    var annotationToken = Current.Clone();
                    _index++;
                    while (Current != TokenKind.NEWLINE)
                    {
                        annotationToken.Append(Current);
                        _index++;
                    }
                    
                    annotationToken.Kind = TokenKind.Annotation;
                    tokens.Add(annotationToken);
                }
                else if (_inContext && Current == TokenKind.Minus && Next == TokenKind.GreaterThen)
                {
                    var nextToken = Current.Clone();
                    _index++;
                    nextToken.Append(Current);
                    nextToken.Kind = TokenKind.Next;
                    tokens.Add(nextToken);
                    _index++;
                }
                else if (_inContext && Current == TokenKind.INDENT)
                {
                    _indents.Push(Current);
                    if (_indents.Count < _indentDepth) tokens.Add(Token.START);
                    _index++; // skip INDENT
                }
                else if (_inContext && Current == TokenKind.SAMEDENT)
                {
                    _index++; // skip SAMEDENT
                    
                    if (!(tokens[^1] == TokenKind.Annotation || 
                        (tokens[^1] == TokenKind.NEWLINE && tokens[^2] == TokenKind.Annotation)) && 
                        _indents.Count < _indentDepth)
                    {
                        tokens.Add(Token.END);
                        tokens.Add(Token.START);
                    }
                }
                else if (_inContext && Current == TokenKind.DEDENT)
                {
                    while (Current == TokenKind.DEDENT)
                    {
                        
                        _indents.Pop();
                        if (_indents.Count > 0) tokens.Add(Token.END);
                        _index++;
                    }

                    if (_indents.Count == 0)
                    {
                        tokens.Add(Token.END_CONTEXT);
                        _inContext = false;
                    }
                    else
                    {
                        tokens.Add(Token.START);
                    }
                }
                else if (_inContext && Current == TokenKind.Word && Current.Value == "extends")
                {
                    Current.Kind = TokenKind.KWExtends;
                    tokens.Add(Current);
                    _index++;
                }
                else if (_inContext && Current == TokenKind.Word && Current.Value == "if")
                {
                    Current.Kind = TokenKind.KWIf;
                    tokens.Add(Current);
                    _index++;
                }
                else if (_inContext && Current == TokenKind.Word && Current.Value == "else")
                {
                    Current.Kind = TokenKind.KWElse;
                    tokens.Add(Current);
                    _index++;
                }
                // LIST ITEMS
                else if (
                    _inContext && 
                    Current == TokenKind.NEWLINE && 
                    (Next == TokenKind.INDENT || Next == TokenKind.SAMEDENT) && 
                    Peek(2) == TokenKind.Minus)
                {
                    var _annotations = new List<Token>();
                    while (tokens.Last() == TokenKind.Annotation)
                    {
                        _annotations.Add(tokens.Last());
                        tokens.RemoveAt(tokens.Count - 1);
                    }
                    
                    tokens.Add(Token.START_LIST_ITEM);
                    tokens.AddRange(_annotations);
                    
                    Take();
                    if (Current == TokenKind.INDENT) _indents.Push(Current);
                    Take();
                    Take();
                }
                else if (_inContext && Current == TokenKind.DoubleQuote)
                {
                    _index++; // skip the double quote symbol 
                    var stringToken = Current.Clone();
                    _index++;
                    while (Current != TokenKind.DoubleQuote)
                    {
                        stringToken.Append(Current);
                        _index++;
                    }
                    _index++; // skip the closing double quote symbol
                    stringToken.Kind = TokenKind.String;
                    tokens.Add(stringToken);
                }
                else if (Current == TokenKind.EOF)
                {
                    break;
                }
                else if (Current == TokenKind.ROOT) _index++;
                else
                {
                    tokens.Add(Current);
                    _index++;
                }
                
                
            }

            while (_indents.Count > 0)
            {
                if (_indents.Count < _indentDepth)
                    tokens.Add(Token.END);
                _indents.Pop();
            }
            if (_inContext) tokens.Add(Token.END_CONTEXT);
            tokens.Add(Token.EOF);
            this.Tokens = tokens;
            return tokens;
        }
    }
}
