using System.Text.RegularExpressions;

namespace Compiler
{
    public class Lexer
    {
        private readonly string _code;
        private readonly int _length;

        // Not used now, but once we get lexing errors,
        // this will be the place to put them.
        private ErrorSink _errorSink;

        private const char INDENT = '▀';
        private const char NEWLINE = '\n';

        public List<Token> Tokens { get; } = new();


        // clean trailing spaces from each line in the text
        private string CleanTrailingSpaces(string code)
        {
            var code2 = 
                code
                    .Replace("\t", "    ")
                    .Replace("    ", INDENT.ToString());

            // regex for replacing newlines
            var regex = new Regex(" *\\r?\\n");
            return regex.Replace(code2, "\n");
        }

        public Lexer(string code, ErrorSink errorSink)
        {
            this._code = CleanTrailingSpaces(code);
            this._length = this._code.Length;
            this._errorSink = errorSink;
        }

        // return tokens from the code
        public List<Token> Lex()
        {
            // clean up
            this.Tokens.Clear();

            var index = 0;
            var indentDepth = 0;
            var tokens = new List<Token>();
            Token? token = null;

            var line = 0;
            var column = 0;

            var add = (TokenType t, char c) =>
            {
                tokens.Add(new Token(t, c, line, column));
                index++;
                column++;
            };

            while (index < _length)
            {
                if (token is not null)
                {
                    tokens.Add(token);
                    token = null;
                }

                var c = _code[index];
                if (c == INDENT)
                {
                    int depth = 0;
                    while (index < _length && c == INDENT)
                    {
                        index++;
                        depth++;

                        // set the column
                        column += 4;

                        c = _code[index];
                    }

                    if (depth > indentDepth)
                    {
                        for (var i = indentDepth; i < depth; i++)
                            tokens.Add(Token.INDENT);
                    }
                    else if (depth < indentDepth)
                    {
                        for (var i = depth; i < indentDepth; i++)
                            tokens.Add(Token.DEDENT);
                    }
                    else tokens.Add(Token.SAMEDENT);

                    indentDepth = depth;
                }
                else if (c == NEWLINE)
                {
                    tokens.Add(new Token(TokenType.NEWLINE, '\n', line, column));
                    if (indentDepth > 0 && index + 1 < _length && _code[index +1] != NEWLINE && _code[index + 1] != INDENT)
                    {
                        tokens.Add(Token.DEDENT);
                        indentDepth = 0;
                    }

                    index++;
                    line++;
                    column = 0;
                }
                else if (c == '>') add(TokenType.GreaterThen, c);
                else if (c == '<') add(TokenType.LessThen, c);
                else if (c == '\\') add(TokenType.Backslash, c);
                else if (c == '/') add(TokenType.Slash, c);
                else if (c == '=') add(TokenType.Equal, c);
                else if (c == '*') add(TokenType.Star, c);
                else if (c == '-') add(TokenType.Minus, c);
                else if (c == '+') add(TokenType.Plus, c);
                else if (c == '!') add(TokenType.Exclemation, c);
                else if (c == '(') add(TokenType.LeftParen, c);
                else if (c == ')') add(TokenType.RightParen, c);
                else if (c == '{') add(TokenType.LeftBrace, c);
                else if (c == '}') add(TokenType.RightBrace, c);
                else if (c == '[') add(TokenType.LeftBracket, c);
                else if (c == ']') add(TokenType.RightBracket, c);
                else if (c == '^') add(TokenType.Pow, c);
                else if (c == '@') add(TokenType.At, c);
                else if (c == '!') add(TokenType.Exclamation, c);
                else if (c == '~') add(TokenType.Tilde, c);
                else if (c == '`') add(TokenType.Apostrophe, c);
                else if (c == '$') add(TokenType.Dollar, c);
                else if (c == '%') add(TokenType.Percentage, c);
                else if (c == '#') add(TokenType.Hash, c);
                else if (c == '&') add(TokenType.And, c);
                else if (c == '|') add(TokenType.Or, c);
                else if (c == '_') add(TokenType.Underscore, c);
                else if (c == '.') add(TokenType.Dot, c);
                else if (c == ',') add(TokenType.Comma, c);
                else if (c == ':') add(TokenType.Colon, c);
                else if (c == ';') add(TokenType.SemiColon, c);
                else if (c == '\'') add(TokenType.Quote, c);
                else if (c == '\"') add(TokenType.DoubleQuote, c);
                else if (c == ' ') add(TokenType.SPACE, c);

                // test for language things
                else if (isLeadingCharacter(c))
                {                   
                    while (index < _length && isLeadingCharacter(c) || isNumber(c))
                    {
                        if (token is null)
                        {
                            token = new Token(TokenType.Word, c, line, column);
                        }
                        else token.Add(c);

                        index++;
                        column++;
                        if (index < _length)
                            c = _code[index];
                    }

                    if (tokens.Count == 0 || tokens.Last().Equals(TokenType.NEWLINE)) {
                        if (token?.Value == "component") token.Type = TokenType.KWComponent;
                        if (token?.Value == "system") token.Type = TokenType.KWSystem;
                        if (token?.Value == "endpoint") token.Type = TokenType.KWEndpoint;
                        if (token?.Value == "let") token.Type = TokenType.KWLet;
                        if (token?.Value == "type") token.Type = TokenType.KWType;
                        if (token?.Value == "record") token.Type = TokenType.KWRecord;
                        if (token?.Value == "data") token.Type = TokenType.KWData;
                        if (token?.Value == "choice") token.Type = TokenType.KWChoice;
                        if (token?.Value == "flow") token.Type = TokenType.KWFlow;
                    }
                }
                else if (isNumber(c))
                {
                    while (index < _length  && isNumber(c))
                    {
                        if (token is null)
                        {
                            token = new Token(TokenType.Number, c, line, column);
                        }
                        else token.Add(c);

                        index++;
                        column++;
                        if (index < _length)
                            c = _code[index];
                    }
                }
                else
                {
                    if (token is null)
                    {
                        token = new Token(TokenType.Word, c.ToString(), line, line, column, column);
                    }
                    token.Add(c);
                    index++;
                    column++;
                }

            }

            if (token is not null)
            {
                tokens.Add(token);
                token = null;
            }
            this.Tokens.AddRange(tokens);
            this.Tokens.Add(Token.EOF);
            return this.Tokens;
        }

        private static bool isLeadingCharacter(char c)
        {
            return Mappings.Letters.Contains(c) ||
                c == '_' ||
                (192 <= c && c <= 255) ||   // latin extended 1
                c == 8217 ||                // 
                c == 8216 ||
                c == 8203;
        }

        private static bool isNumber(char c)
        {
            return Mappings.Numbers.Contains(c);
        }
    }
}
