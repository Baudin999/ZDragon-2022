﻿namespace Compiler.Parsers
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
            _ = TakeWhile(() => !Is(TokenType.STOP_CONTEXT)).ToList();
        }
        
        private Token TakeNext() {
            Token current = this._tokens[this._index];
            _index++;
            return current;
        }

        private Token Take()
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) TakeNext();
            return TakeNext();
        }

        

        private Token Take(TokenType type, string message)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) TakeNext();

            if (Current != type)
            {
                Abort(message);
            }
            return TakeNext();
        }

        private Token Take(TokenType type)
        {
            return Take(type, @$"Expected '{type}' but received a '{Current.Type}'.");
        }
        private IEnumerable<Token> TakeWhile(TokenType type)
        {
            // Take the tokens if they are of the TokenType type, but
            // skip the NEWLINEs and SPACEs
            while (Is(type) && Current != TokenType.EOF)
                yield return Take(type);
        }
        private IEnumerable<Token> TakeWhile(Func<bool> predicate)
        {
            while(predicate() && Current != TokenType.EOF)
            {
                yield return TakeNext();
            }
        }
        

        private bool Is(TokenType type)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE || Current == TokenType.EOF) TakeNext();
            return Current == type;
        }

        private bool IsOperator() => IsOperator(Current);
        
        private bool IsOperator(Token test)
        {
            
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) TakeNext();
            
            return 
                test == TokenType.Minus ||
                test == TokenType.Plus ||
                test == TokenType.Star ||
                test == TokenType.Backslash;
        }

        private void If(TokenType type, Action parse, Action? elseParse = null)
        {
            if (Is(type))
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
                if (Current == TokenType.KWComponent) AddNode(parseComponent(), @namespace);
                else if (Current == TokenType.KWSystem) AddNode(parseSystem(), @namespace);
                else if (Current == TokenType.KWEndpoint) AddNode(parseEndpoint(), @namespace);
                else if (Current == TokenType.KWType) AddNode(parseTypeDefinition(), @namespace);
                else if (Current == TokenType.KWLet) AddNode(parseAssignmentStatement(), @namespace);
                else if (Current == TokenType.KWRecord) AddNode(parseRecordDefinition(), @namespace);
                else if (Current == TokenType.NEWLINE) TakeNext();
                else if (Current == TokenType.SPACE) TakeNext();
                else if (Current == TokenType.STOP_CONTEXT) TakeNext();
                else if (Current == TokenType.START_CONTEXT) TakeNext();
                else if (Current == TokenType.KWOpen)
                {
                    _ = TakeWhile(() => Current != TokenType.STOP_CONTEXT).ToList();
                }
                else if (Current == TokenType.Hash)
                {
                    Token? chapterToken = null;
                    while (Current != TokenType.NEWLINE && Current != TokenType.EOF)
                    {
                        if (chapterToken is null) chapterToken = TakeNext().Clone();
                        else chapterToken.Append(TakeNext());
                    }
                    if (chapterToken is null) Abort("Invalid chapter");
                    else Nodes.Add(new MarkdownChapterNode(chapterToken));
                }
                else if (Current == TokenType.EOF)
                {
                    TakeNext();
                }
                else
                {
                    Token? paragraphToken = null;
                    while (! (Current == TokenType.EOF || (Current == TokenType.NEWLINE && Next == TokenType.NEWLINE)))
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
