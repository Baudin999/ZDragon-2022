
namespace Compiler
{
    public class Token : IEquatable<TokenKind>
    {
        public TokenKind Kind { get; internal set; }

        private string _value = "";
        

        public string Value => _value;

        public int StartLine { get; }
        public int EndLine { get; private set; }
        public int StartColumn { get; }
        public int EndColumn { get; private set; }
        public static Token EOF => new Token(TokenKind.EOF);

        [JsonConstructor]
        public Token(TokenKind kind, string value, int startLine, int endLine, int startColumn, int endColumn)
        {
            this.Kind = kind;
            this._value = value;
            StartLine = startLine;
            EndLine = endLine;
            StartColumn = startColumn;
            EndColumn = endColumn;
        }
        public Token(TokenKind kind, char value, int line, int column) :
            this(kind, value.ToString(), line, line, column, column + 1)
        {
            // empty
        }
        public Token(TokenKind kind, string value, int line, int column) :
            this(kind, value, line, line, column, column + 1)
        {
            // empty
        }
        
        public Token(TokenKind kind, string value = "")
        {
            Kind = kind;
            _value = value;
            StartLine = -1;
            EndLine = -1;
            StartColumn = -1;
            EndColumn = -1;
        }

        public void Add(char c)
        {
            this._value += c;
            this.EndColumn++;
        }

        public void Add(string s)
        {
            this._value += s;
            this.EndColumn += s.Length;
        }

        public void Append(Token other)
        {
            this.EndLine = other.EndLine;
            this.EndColumn = other.EndColumn;
            this._value += other.Value;
        }

        public Token Transform(TokenKind kind)
        {
            var temp = this.Clone();
            temp.Kind = kind;
            return temp;
        }

        public static Token INDENT => new Token(TokenKind.INDENT, "    ");
        public static Token DEDENT => new Token(TokenKind.DEDENT);
        public static Token SAMEDENT => new Token(TokenKind.SAMEDENT);
        public static Token START_CONTEXT => new Token(TokenKind.START_CONTEXT);
        public static Token STOP_CONTEXT => new Token(TokenKind.STOP_CONTEXT);
        public static Token START => new Token(TokenKind.START);
        public static Token END => new Token(TokenKind.END);
        public static Token EMPTY => new Token(TokenKind.EMPTY);
        public static Token START_LIST_ITEM => new Token(TokenKind.START_LIST_ITEM);
        public static Token STOP_LIST_ITEM => new Token(TokenKind.STOP_LIST_ITEM);
        public static Token START_VIEW_FIELD => new Token(TokenKind.START_VIEW_FIELD);
        public static Token STOP_VIEW_FIELD => new Token(TokenKind.STOP_VIEW_FIELD);
        
        public override string ToString() => $"{Kind} - {_value}";

        public bool Equals(TokenKind other)
        {
            return this.Kind == other;
        }

        public static bool operator ==(Token? a, TokenKind b) => a?.Equals(b) ?? false;
        public static bool operator !=(Token? a, TokenKind b) => !(a?.Equals(b) ?? true);

        public override bool Equals(object? obj)
        {
            if (obj is Token _obj)
            {
                return _obj.Value == this.Value &&
                    _obj.StartLine == this.StartLine &&
                    _obj.EndLine == this.EndLine &&
                    _obj.StartColumn == this.StartColumn &&
                    _obj.EndColumn == this.EndColumn;
            }

            if (ReferenceEquals(this, obj))
            {
                return true;
            }

            if (ReferenceEquals(obj, null))
            {
                return false;
            }

            throw new NotImplementedException();
        }

        public override int GetHashCode()
        {
            return this.Value.GetHashCode() ^ 
                   this.StartLine.GetHashCode() ^ 
                   this.EndLine.GetHashCode() ^ 
                   this.StartColumn.GetHashCode() ^ 
                   this.EndColumn.GetHashCode();
        }

        public Token Clone()
        {
            // clone the current token
            return new Token(Kind, _value, StartLine, EndLine, StartColumn, EndColumn);
        }
    }

    [Flags]
    public enum TokenKind: ulong
    {
        None,
        INDENT,
        DEDENT,
        SAMEDENT,
        START_CONTEXT,
        STOP_CONTEXT,
        END,
        START,
        NEWLINE,
        EMPTY,
        SPACE,
        
        Word,
        GreaterThen,
        LessThen,
        Star,
        Pow,
        Hash,
        DoubleQuote,
        Quote,
        LeftParen,
        RightParen,
        LeftBrace,
        RightBrace,
        Backslash,
        Slash,
        Equal,
        Minus,
        Plus,
        LeftBracket,
        RightBracket,
        At,
        Exclamation,
        Tilde,
        Dollar,
        Percentage,
        And,
        Or,
        Underscore,
        Dot,
        Colon,
        SemiColon,
        Number,
        
        Next,
        String,
        Identifier,
        EmptyParamList,
        Comma,
        Annotation,
        Apostrophe,
        
        Lambda,
        TypeDef,
        Pipe,
        CommentLiteral,
        CodeLiteral,
        
        KWComponent,
        KWEndpoint,
        KWSystem,
        KWLet,
        KWExtends,
        KWIf,
        KWElse,
        KWType,
        KWRecord,
        KWData,
        KWChoice,
        KWFlow,
        KWOpen,
        KWAggregate,
        KWView,
        KWGuideline,
        KWRequirement,
        KWInclude,
        KWImage,
        KWInteraction,
        KWPerson,
        KWBusiness,
        KWRoadmap,
        KWMilestone,
        KWTask,
        KWWhere,
        KWWhile,
        KWEnd,
        KWHidden,
        EOF,
        Exclemation,
       
        Unknown,
        
        // indentations
        ContextualIndent1,
        ContextualIndent2,
        ContextualIndent3,
        ContextualIndent4,
        ContextualIndent5,
        ContextualIndent6,
        ContextualIndent7,
        ContextualIndent8,
        ContextualIndent9,
        ContextualIndent10,
        ContextualIndent11,
        ContextualIndent12,
        ContextualIndent13,
        ContextualIndent14,
        ContextualIndent15,
        ContextualIndent16,
        ContextualIndent17,
        ContextualIndent18,
        ContextualIndent19,
        ContextualIndent20,
        ContextualIndent21,
        
        START_LIST_ITEM,
        STOP_LIST_ITEM,
        START_VIEW_FIELD,
        STOP_VIEW_FIELD
    }


}