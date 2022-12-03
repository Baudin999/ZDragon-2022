namespace Compiler.Parsers
{
    public partial class Parser : TokenIterator
    {
        private readonly ErrorSink _errorSink;

        public List<AstNode> Nodes { get; private set; }

        public List<NodeReference> References { get; }
       

        public Parser(List<Token> tokens, ErrorSink errorSink, List<NodeReference> references) : base(tokens, errorSink)
        {
            this._index = 0;
            this._errorSink = errorSink;
            this._max = tokens.Count;
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

            while (hasCurrent)
            {
                if (Current == TokenKind.KWComponent) AddNode(parseComponent(), @namespace);
                else if (Current == TokenKind.KWSystem) AddNode(parseSystem(), @namespace);
                else if (Current == TokenKind.KWEndpoint) AddNode(parseEndpoint(), @namespace);
                else if (Current == TokenKind.KWType) AddNode(parseTypeDefinition(), @namespace);
                else if (Current == TokenKind.KWLet) AddNode(parseAssignmentStatement(), @namespace);
                else if (Current == TokenKind.KWRecord) AddNode(parseRecordDefinition(), @namespace);
                else if (Current == TokenKind.KWData) AddNode(parseDataDefinition(), @namespace);
                else if (Current == TokenKind.KWEnum) AddNode(parseEnumNode(), @namespace);
                else if (Current == TokenKind.KWView) AddNode(parseViewNode(), @namespace);
                else if (Current == TokenKind.KWChapter) AddNode(parseChapterNode(), @namespace);
                else if (Current == TokenKind.KWParagraph) AddNode(parseParagraphNode(), @namespace);
                else if (Current == TokenKind.NEWLINE) TakeCurrent();
                else if (Current == TokenKind.SPACE) TakeCurrent();
                else if (Current == TokenKind.END_CONTEXT) TakeCurrent();
                else if (Current == TokenKind.START_CONTEXT) TakeCurrent();
                else if (Current == TokenKind.DEDENT) TakeCurrent();
                else if (Current == TokenKind.INDENT) TakeCurrent();
                else if (Current == TokenKind.KWOpen)
                {
                    var openTokens = TakeWhile(() => Current != TokenKind.END_CONTEXT).ToList();
                    Take(TokenKind.END_CONTEXT);
                    Nodes.Add(new OpenNode(openTokens));
                }
                else if (Current == TokenKind.Hash)
                {
                    Token? chapterToken = null;
                    while (Current != TokenKind.NEWLINE && Current != TokenKind.EOF)
                    {
                        if (chapterToken is null) chapterToken = TakeCurrent().Clone();
                        else chapterToken.Append(TakeCurrent());
                    }
                    if (chapterToken is null) Abort("Invalid chapter");
                    else Nodes.Add(new MarkdownChapterNode(chapterToken));
                }
                else if (Current == TokenKind.EOF)
                {
                    TakeCurrent();
                }
                else
                {
                    Token? paragraphToken = null;
                    while (! (Current == TokenKind.EOF || (Current == TokenKind.NEWLINE && Next == TokenKind.NEWLINE)))
                    {
                        if (paragraphToken is null) paragraphToken = TakeCurrent().Clone();
                        else paragraphToken.Append(TakeCurrent());
                    }
                    if (paragraphToken is null) Abort("Invalid paragraph");
                    else Nodes.Add(new MarkdownParagraphNode(paragraphToken));
                }
            }

            return Nodes;
        }

        
    }
}
