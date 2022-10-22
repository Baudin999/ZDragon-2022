
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
        public static Token END_CONTEXT => new Token(TokenKind.END_CONTEXT);
        public static Token START => new Token(TokenKind.START);
        public static Token END => new Token(TokenKind.END);
        public static Token EMPTY => new Token(TokenKind.EMPTY);
        public static Token START_LIST_ITEM => new Token(TokenKind.START_LIST_ITEM);
        public static Token END_LIST_ITEM => new Token(TokenKind.END_LIST_ITEM);
        public static Token START_VIEW_FIELD => new Token(TokenKind.START_VIEW_FIELD);
        public static Token END_VIEW_FIELD => new Token(TokenKind.END_VIEW_FIELD);
        public static Token ROOT => new Token(TokenKind.ROOT);
        public static Token EOF => new Token(TokenKind.EOF);
        
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
}