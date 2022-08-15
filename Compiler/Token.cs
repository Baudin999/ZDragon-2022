using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace Compiler
{
    public class Token : IEquatable<TokenType>
    {
        public TokenType Type { get; internal set; }

        private string _value = "";
        public string Value => _value;

        public int StartLine { get; }
        public int EndLine { get; private set; }
        public int StartColumn { get; }
        public int EndColumn { get; private set; }
        public static Token EOF => new Token(TokenType.EOF);

        public Token(TokenType type, string value, int startLine, int endLine, int startColumn, int endColumn)
        {
            this.Type = type;
            this._value = value;
            StartLine = startLine;
            EndLine = endLine;
            StartColumn = startColumn;
            EndColumn = endColumn;
        }
        public Token(TokenType type, char value, int line, int column) :
            this(type, value.ToString(), line, line, column, column)
        {
            // empty
        }


        private Token(TokenType type)
        {
            Type = type;
            _value = "";
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

        public void Append(Token other)
        {
            this.EndLine = other.EndLine;
            this.EndColumn = other.EndColumn;
            this._value += other.Value;
        }

        public static Token INDENT => new Token(TokenType.INDENT);
        public static Token DEDENT => new Token(TokenType.DEDENT);
        public static Token SAMEDENT => new Token(TokenType.SAMEDENT);
        public static Token START_CONTEXT => new Token(TokenType.START_CONTEXT);
        public static Token STOP_CONTEXT => new Token(TokenType.STOP_CONTEXT);
        public static Token START => new Token(TokenType.START);
        public static Token END => new Token(TokenType.END);
        
        public override string ToString() => $"{Type} - {_value}";

        public bool Equals(TokenType other)
        {
            return this.Type == other;
        }

        public static bool operator ==(Token? a, TokenType b) => a?.Equals(b) ?? false;
        public static bool operator !=(Token? a, TokenType b) => !(a?.Equals(b) ?? true);

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
            return new Token(Type, _value, StartLine, EndLine, StartColumn, EndColumn);
        }
    }

    public enum TokenType
    {
        INDENT,
        DEDENT,
        SAMEDENT,
        START_CONTEXT,
        STOP_CONTEXT,
        END,
        START,
        
        Word,
        GreaterThen,
        LessThen,
        Star,
        Pow,
        SPACE,
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
        NEWLINE,
        KWComponent,
        KWEndpoint,
        KWSystem,
        KWLet,
        KWExtends,
        KWIf,
        KWElse,
        EOF,
        Exclemation,
        KWType,
        Next
    }


}