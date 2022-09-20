namespace Compiler.Parsers
{
    public partial class Parser
    {
        private readonly List<Token> _tokens;
        private int _index;
        private readonly ErrorSink _errorSink;

        private Token Current => _tokens[this._index];
        private Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);

        public List<AstNode> Nodes { get; private set; }

        public List<NodeReference> References { get; }

        private void Abort(string message)
        {
            var target = Current.Clone();
            if (target.StartLine == -1 && _index > 0)
                target = this._tokens[_index - 1].Clone();
            
            _errorSink.Errors.Add(new Error(target, message));
            _ = TakeWhile(() => !Is(TokenKind.STOP_CONTEXT)).ToList();
        }
        
        private Token TakeNext() {
            Token current = this._tokens[this._index];
            _index++;
            return current;
        }

        private Token Take()
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeNext();
            return TakeNext();
        }

        

        private Token Take(TokenKind kind, string message)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeNext();

            if (Current != kind)
            {
                Abort(message);
            }
            return TakeNext();
        }

        private Token Take(TokenKind kind)
        {
            return Take(kind, @$"Expected '{kind}' but received a '{Current.Kind}'.");
        }
        private IEnumerable<Token> TakeWhile(TokenKind kind)
        {
            // Take the tokens if they are of the TokenType type, but
            // skip the NEWLINEs and SPACEs
            while (Is(kind) && Current != TokenKind.EOF)
                yield return Take(kind);
        }
        private IEnumerable<Token> TakeWhile(Func<bool> predicate)
        {
            while(predicate() && Current != TokenKind.EOF)
            {
                yield return TakeNext();
            }
        }
        private IEnumerable<Token> TakeWhile(Func<Token, bool> predicate)
        {
            while(Current != TokenKind.EOF && predicate(Current))
            {
                yield return TakeNext();
            }
        }
        

        private bool Is(TokenKind kind)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE || Current == TokenKind.EOF) TakeNext();
            return Current == kind;
        }

        private bool IsOperator() => IsOperator(Current);
        
        private bool IsOperator(Token test)
        {
            
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeNext();
            
            return 
                test == TokenKind.Minus ||
                test == TokenKind.Plus ||
                test == TokenKind.Star ||
                test == TokenKind.Backslash;
        }

        private void If(TokenKind kind, Action parse, Action? elseParse = null)
        {
            if (Is(kind))
                parse();
            else
            {
                elseParse?.Invoke();
            }
        }

        public Parser(List<Token> tokens, ErrorSink errorSink, List<NodeReference> references)
        {
            this._tokens = tokens;
            this._index = 0;
            this._errorSink = errorSink;
            this.Nodes = new List<AstNode>();
            this.References = references;
        }

        private void AddNode(AstNode? node, string @namespace)
        {
            if (node is not null)
            {
                node.Namespace = @namespace;
                ExtractReferences(node);
                Nodes.Add(node);
            }
        }

        public List<AstNode> Parse(string @namespace = "")
        {
            Nodes = new List<AstNode>();

            while (_index < this._tokens.Count)
            {
                if (Current == TokenKind.KWComponent) AddNode(parseComponent(), @namespace);
                else if (Current == TokenKind.KWSystem) AddNode(parseSystem(), @namespace);
                else if (Current == TokenKind.KWEndpoint) AddNode(parseEndpoint(), @namespace);
                else if (Current == TokenKind.KWType) AddNode(parseTypeDefinition(), @namespace);
                else if (Current == TokenKind.KWLet) AddNode(parseAssignmentStatement(), @namespace);
                else if (Current == TokenKind.KWRecord) AddNode(parseRecordDefinition(), @namespace);
                else if (Current == TokenKind.KWView) AddNode(parseViewNode(), @namespace);
                else if (Current == TokenKind.NEWLINE) TakeNext();
                else if (Current == TokenKind.SPACE) TakeNext();
                else if (Current == TokenKind.STOP_CONTEXT) TakeNext();
                else if (Current == TokenKind.START_CONTEXT) TakeNext();
                else if (Current == TokenKind.KWOpen)
                {
                    _ = TakeWhile(() => Current != TokenKind.STOP_CONTEXT).ToList();
                }
                else if (Current == TokenKind.Hash)
                {
                    Token? chapterToken = null;
                    while (Current != TokenKind.NEWLINE && Current != TokenKind.EOF)
                    {
                        if (chapterToken is null) chapterToken = TakeNext().Clone();
                        else chapterToken.Append(TakeNext());
                    }
                    if (chapterToken is null) Abort("Invalid chapter");
                    else Nodes.Add(new MarkdownChapterNode(chapterToken));
                }
                else if (Current == TokenKind.EOF)
                {
                    TakeNext();
                }
                else
                {
                    Token? paragraphToken = null;
                    while (! (Current == TokenKind.EOF || (Current == TokenKind.NEWLINE && Next == TokenKind.NEWLINE)))
                    {
                        if (paragraphToken is null) paragraphToken = TakeNext().Clone();
                        else paragraphToken.Append(TakeNext());
                    }
                    if (paragraphToken is null) Abort("Invalid paragraph");
                    else Nodes.Add(new MarkdownParagraphNode(paragraphToken));
                }
            }

            return Nodes;
        }

        
    }
}
