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
        private const char NEWLINE = '█';

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
            return regex.Replace(code2, NEWLINE.ToString());
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

            var add = (TokenKind t, char c) =>
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
                    
                    if (indentDepth > 0 && index + 1 < _length && _code[index + 1] != NEWLINE && _code[index + 1] != INDENT)
                    {
                        for (var i = 0; i < indentDepth; ++i)
                        {
                            tokens.Add(Token.DEDENT);
                        }

                        indentDepth = 0;
                    }
                    
                    tokens.Add(new Token(TokenKind.NEWLINE, Environment.NewLine, line, column));

                    index++;
                    line++;
                    column = 0;
                }
                else if (c == '>') add(TokenKind.GreaterThen, c);
                else if (c == '<') add(TokenKind.LessThen, c);
                else if (c == '\\') add(TokenKind.Backslash, c);
                else if (c == '/') add(TokenKind.Slash, c);
                else if (c == '=') add(TokenKind.Equal, c);
                else if (c == '*') add(TokenKind.Star, c);
                else if (c == '-') add(TokenKind.Minus, c);
                else if (c == '+') add(TokenKind.Plus, c);
                else if (c == '!') add(TokenKind.Exclemation, c);
                else if (c == '(') add(TokenKind.LeftParen, c);
                else if (c == ')') add(TokenKind.RightParen, c);
                else if (c == '{') add(TokenKind.LeftBrace, c);
                else if (c == '}') add(TokenKind.RightBrace, c);
                else if (c == '[') add(TokenKind.LeftBracket, c);
                else if (c == ']') add(TokenKind.RightBracket, c);
                else if (c == '^') add(TokenKind.Pow, c);
                else if (c == '@') add(TokenKind.At, c);
                else if (c == '!') add(TokenKind.Exclamation, c);
                else if (c == '~') add(TokenKind.Tilde, c);
                else if (c == '`') add(TokenKind.Apostrophe, c);
                else if (c == '$') add(TokenKind.Dollar, c);
                else if (c == '%') add(TokenKind.Percentage, c);
                else if (c == '#') add(TokenKind.Hash, c);
                else if (c == '&') add(TokenKind.And, c);
                else if (c == '|') add(TokenKind.Or, c);
                else if (c == '_') add(TokenKind.Underscore, c);
                else if (c == '.') add(TokenKind.Dot, c);
                else if (c == ',') add(TokenKind.Comma, c);
                else if (c == ':') add(TokenKind.Colon, c);
                else if (c == ';') add(TokenKind.SemiColon, c);
                else if (c == '\'') add(TokenKind.Quote, c);
                else if (c == '\"') add(TokenKind.DoubleQuote, c);
                else if (c == ' ') add(TokenKind.SPACE, c);

                // test for language things
                else if (isLeadingCharacter(c))
                {                   
                    while (index < _length && isLeadingCharacter(c) || isNumber(c))
                    {
                        if (token is null)
                        {
                            token = new Token(TokenKind.Word, c, line, column);
                        }
                        else token.Add(c);

                        index++;
                        column++;
                        if (index < _length)
                            c = _code[index];
                    }

                    if (tokens.Count == 0 || tokens.Last().Equals(TokenKind.NEWLINE) && token is not null)
                    {
                        var found = Mappings.Keywords.TryGetValue(token?.Value ?? "__not_implemented__", out var kind);
                        if (found && token is not null) token.Kind = kind;
                    }
                }
                else if (isNumber(c))
                {
                    while (index < _length  && isNumber(c))
                    {
                        if (token is null)
                        {
                            token = new Token(TokenKind.Number, c, line, column);
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
                        token = new Token(TokenKind.Word, c.ToString(), line, line, column, column);
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
