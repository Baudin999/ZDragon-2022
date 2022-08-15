using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace Compiler
{
    public class Token : IEquatable<TokenType>
    {
        public TokenType Type { get; internal set; }

        private string value = "";
        public string Value => value;

        public int StartLine { get; }
        public int EndLine { get; private set; }
        public int StartColumn { get; }
        public int EndColumn { get; private set; }

        public Token(TokenType type, string value, int startLine, int endLine, int startColumn, int endColumn)
        {
            this.Type = type;
            this.value = value;
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
            value = "";
            StartLine = -1;
            EndLine = -1;
            StartColumn = -1;
            EndColumn = -1;
        }

        public void Add(char c)
        {
            this.value += c;
            this.EndColumn++;
        }

        public static Token INDENT()
        {
            return new Token(TokenType.INDENT);
        }
        public static Token DEDENT()
        {
            return new Token(TokenType.DEDENT);
        }

        public static Token START_CONTEXT()
        {
          return new Token(TokenType.START_CONTEXT);
        }

        public static Token STOP_CONTEXT()
        {
            return new Token(TokenType.STOP_CONTEXT);
        }


        public override string ToString() => $"{Type} - {value}";

        public bool Equals(TokenType other)
        {
            return this.Type == other;
        }

        public static bool operator ==(Token? a, TokenType b) => a?.Equals(b) ?? false;
        public static bool operator !=(Token? a, TokenType b) => !(a?.Equals(b) ?? true);

    }

    public enum TokenType
    {
        INDENT,
        DEDENT,
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
        START_CONTEXT,
        STOP_CONTEXT
    }


}