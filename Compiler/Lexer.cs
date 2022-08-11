﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Compiler
{
    public class Lexer
    {
        private string _code;
        private int _length;
        private const char INDENT = '▀';
        private const char NEWLINE = '\n';

        public List<Token> Tokens { get; private set; } = new List<Token>();


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

            //var lines = code2.Split('\n');
            //var sb = new StringBuilder();
            //foreach (var line in lines)
            //{
            //    var trimmed = line.TrimEnd();
            //    sb.Append(trimmed + '\n');
            //}
            //return sb.ToString();
        }

        public Lexer(string code)
        {
            this._code = CleanTrailingSpaces(code);
            this._length = this._code.Length;

            Lex();
        }

        // return tokens from the code
        private void Lex()
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
                    while (c == INDENT)
                    {
                        index++;
                        depth++;

                        // set the column
                        column += 4;

                        c = _code[index];
                    }

                    if (depth > indentDepth) tokens.Add(Token.INDENT());
                    else if (depth < indentDepth) tokens.Add(Token.DEDENT());

                    indentDepth = depth;
                }
                else if (c == NEWLINE)
                {
                    tokens.Add(new Token(TokenType.NEWLINE, '\n', line, column));
                    if (indentDepth > 0 && index + 1 < _length && _code[index + 1] != INDENT)
                    {
                        tokens.Add(Token.DEDENT());
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
                else if (c == '(') add(TokenType.LeftParen, c);
                else if (c == ')') add(TokenType.RightParen, c);
                else if (c == '{') add(TokenType.LeftBrace, c);
                else if (c == '}') add(TokenType.RightBrace, c);
                else if (c == '[') add(TokenType.LeftBracket, c);
                else if (c == ']') add(TokenType.RightBracket, c);
                else if (c == '^') add(TokenType.Pow, c);
                else if (c == '@') add(TokenType.At, c);
                else if (c == '!') add(TokenType.Exclamation, c);
                else if (c == '`') add(TokenType.Tilde, c);
                else if (c == '$') add(TokenType.Dollar, c);
                else if (c == '%') add(TokenType.Percentage, c);
                else if (c == '#') add(TokenType.Hash, c);
                else if (c == '&') add(TokenType.And, c);
                else if (c == '|') add(TokenType.Or, c);
                else if (c == '_') add(TokenType.Underscore, c);
                else if (c == '.') add(TokenType.Dot, c);
                else if (c == ':') add(TokenType.Colon, c);
                else if (c == ';') add(TokenType.SemiColon, c);
                else if (c == '\'') add(TokenType.Quote, c);
                else if (c == '\"') add(TokenType.DoubleQuote, c);
                else if (c == ' ') add(TokenType.SPACE, c);

                // test for language things
                else if (isLeadingCharacter(c))
                {                   
                    while (isLeadingCharacter(c) || isNumber(c))
                    {
                        if (token is null)
                        {
                            token = new Token(TokenType.Word, c, line, column);
                        }
                        else token.Add(c);

                        index++;
                        column++;
                        c = _code[index];
                    }

                    if (tokens.Last().Equals(TokenType.NEWLINE)) {
                        if (token?.Value == "component") token.Type = TokenType.KWComponent;
                        if (token?.Value == "system") token.Type = TokenType.KWSystem;
                        if (token?.Value == "endpoint") token.Type = TokenType.KWEndpoint;
                    }
                }
                else if (isNumber(c))
                {
                    while (isNumber(c))
                    {
                        if (token is null)
                        {
                            token = new Token(TokenType.Number, c, line, column);
                        }
                        else token.Add(c);

                        index++;
                        column++;
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
                }

            }

            if (token is not null)
            {
                tokens.Add(token);
                token = null;
            }
            this.Tokens.AddRange(tokens);
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
