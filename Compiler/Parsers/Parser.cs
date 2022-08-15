using Compiler.Parsers.Nodes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Compiler.Parsers
{
    public partial class Parser
    {
        private List<Token> _tokens;
        private int _index;
        private Token Current => this._tokens[this._index];
        private Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);
        
        private Token Take() {
            Token current = this._tokens[this._index];
            _index++;
            return current;
        }

        private Token Take(TokenType type)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) Take();

            if (Current != type) throw new ParsingException();
            return Take();
        }
        private IEnumerable<Token> TakeWhile(TokenType type)
        {
            // Take the tokens if they are of the TokenType type, but
            // skip the NEWLINEs and SPACEs
            while (If(type))
                yield return Take(type);
        }

        public bool If(TokenType type)
        {
            // if you want a real token type, ignore spaces and newlines
            while (Current == TokenType.SPACE || Current == TokenType.NEWLINE) Take();
            return Current == type;
        }

        public void If(TokenType type, Action parse)
        {
            if (If(type))
                parse();
        }

        public Parser(List<Token> tokens)
        {
            this._tokens = tokens;
            this._index = 0;
        }

        public List<AstNode> Parse()
        {
            List<AstNode> result = new List<AstNode>();
            while (_index < this._tokens.Count)
            {
                if (Current == TokenType.KWComponent)
                {
                    result.Add(parseComponent());
                }
                else
                {
                    Take();
                }
            }

            return result;
        }

        
    }
}
