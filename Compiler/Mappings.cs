using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Compiler
{
    internal static class Mappings
    {

        public static Token? Merge(this IEnumerable<Token> tokens, TokenKind kind)
        {
            Token? result = null;
            foreach (Token token in tokens)
            {
                if (result is null) result = token;
                else result.Append(token);
            }

            if (result is not null)
                result.Kind = kind;
            return result;
        }

        public static void ContinueWith(this bool decision, Action next, Action? failure = null)
        {
            if (decision)
            {
                next();
            }
            else
            {
                if (failure is not null) failure?.Invoke();
            }
        }
        
        public static void ContinueWith(this IEnumerable<bool> decisions, Action next, Action? failure = null)
        {
            foreach (var decision in decisions)
            {
                if (decision)
                {
                    next();
                }
                else
                {
                    if (failure is not null) failure?.Invoke();
                }
            }
        }
        
        public static List<int> Operators = new List<int> {
            0x26,               // &
            0x2A,               // *
            0x40,               // @
            0x5C,               // \
            0x60,               // `
            0x7C,               // |
            0x5E,               // ^
            0x7D,               // }
            0x5D,               // ]
            0x29,               // )
            0x3A,               // :
            0x2C,               // ,
            0x2E,               // .
            0x22,               // "
            0x3D,               // =
            0x21,               // !
            0x3E,               // >
            0x23,               // #
            0x3C,               // <
            0x2D,               // -
            0x7B,               // {
            0x5B,               // [
            0x28,               // (
            0x25,               // %
            0x2B,               // +
            0x3F,               // ?
            0x3B,               // ;
            0x27,               // '
            0x2F,               // /
            0x7E                // ~
        };
        internal static List<int> Letters = new List<int> {
            0x61, // a
            0x62, // b
            0x63, // c
            0x64, // d
            0x65, // e
            0x66, // f
            0x67, // g
            0x68, // h
            0x69, // i
            0x6A, // j
            0x6B, // k
            0x6C, // l
            0x6D, // m
            0x6E, // n
            0x6F, // o
            0x70, // p
            0x71, // q
            0x72, // r
            0x73, // s
            0x74, // t
            0x75, // u
            0x76, // v
            0x77, // w
            0x78, // x
            0x79, // y
            0x7A, // z

            0x41, // A
            0x42, // B
            0x43, // C
            0x44, // D
            0x45, // E
            0x46, // F
            0x47, // G
            0x48, // H
            0x49, // I
            0x4A, // J
            0x4B, // K
            0x4C, // L
            0x4D, // M
            0x4E, // N
            0x4F, // O 
            0x50, // P
            0x51, // Q
            0x52, // R
            0x53, // S
            0x54, // T
            0x55, // U
            0x56, // V
            0x57, // W
            0x58, // X
            0x59, // Y
            0x5a, // Z
        };

        internal static List<int> Numbers = new List<int> {
            0x30, // 0
            0x31, // 1
            0x32, // 2
            0x33, // 3
            0x34, // 4
            0x35, // 5
            0x36, // 6
            0x37, // 7
            0x38, // 8
            0x39, // 9
        };
        
        public static Dictionary<string, TokenKind> CombinedOperatorDefinitions = new Dictionary<string, TokenKind> {
                { "=>", TokenKind.Lambda },
                { "::", TokenKind.TypeDef }
            };

        public static Dictionary<string, TokenKind> SingleOperatorDefinitions = new Dictionary<string, TokenKind> {
                { "=", TokenKind.Equal },
                { ">", TokenKind.GreaterThen },
                { "<", TokenKind.LessThen },
                { "(", TokenKind.LeftParen },
                { ")", TokenKind.RightParen },
                { "{", TokenKind.LeftBrace },
                { "}", TokenKind.RightBrace },
                { "\"", TokenKind.DoubleQuote },
                { "'", TokenKind.Quote },
                { "+", TokenKind.Plus },
                { "-", TokenKind.Minus },
                { "*", TokenKind.Star },
                { "/", TokenKind.Slash },
                { "\\", TokenKind.Backslash },
                { ",", TokenKind.Comma },
                { ".", TokenKind.Dot },
                { "^", TokenKind.Pow },
                { "~", TokenKind.Tilde },
                { "#", TokenKind.Hash },
                { "|", TokenKind.Or },
                { "&", TokenKind.And },
                { ":", TokenKind.Colon },
                { "%", TokenKind.Percentage },
                { "`", TokenKind.Apostrophe },
                { ";", TokenKind.SemiColon },
                { "@", TokenKind.At }
            };


        public static readonly Dictionary<string, TokenKind> Keywords = new Dictionary<string, TokenKind> {
                // type system 
                { "record", TokenKind.KWRecord },
                { "type", TokenKind.KWType },
                { "data", TokenKind.KWData },
                { "choice", TokenKind.KWChoice },
                { "open", TokenKind.KWOpen },
                { "extends", TokenKind.KWExtends },
                { "aggregate", TokenKind.KWAggregate },

                // doc types
                { "view", TokenKind.KWView },
                { "guideline", TokenKind.KWGuideline },
                { "requirement", TokenKind.KWRequirement },
                { "include", TokenKind.KWInclude },
                { "image", TokenKind.KWImage },

                // architecture
                { "person", TokenKind.KWPerson },
                { "system", TokenKind.KWSystem },
                { "component", TokenKind.KWComponent },
                { "endpoint", TokenKind.KWEndpoint },
                { "interaction", TokenKind.KWInteraction },
                { "business", TokenKind.KWBusiness },

                // planning
                { "roadmap",    TokenKind.KWRoadmap },
                { "milestone",  TokenKind.KWMilestone },
                { "task",       TokenKind.KWTask },

                // flow
                { "flow", TokenKind.KWFlow },
                { "if", TokenKind.KWIf },
                { "else", TokenKind.KWElse },
                { "where", TokenKind.KWWhere },
                { "while", TokenKind.KWWhile },
                { "let", TokenKind.KWLet },
                { "end", TokenKind.KWEnd },

                // rendering
                { "hidden", TokenKind.KWHidden },
                
                // document rendering
                {"chapter", TokenKind.KWChapter },
                {"paragraph", TokenKind.KWParagraph},
                {"p", TokenKind.KWParagraph},
            };
    }
}

