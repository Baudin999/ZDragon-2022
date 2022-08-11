using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Compiler.Test
{
    internal class Grouper
    {
        private List<Token> _tokens;
        private int _length;
        private bool _inContext;
        private int _index;

        private Token Current => this._tokens[this._index];
        private Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);

        public Grouper(List<Token> tokens)
        {
            this._tokens = tokens;
            this._length = tokens.Count;
            this._inContext = false;
            this._index = 0;
        }

        public List<Token> Group()
        {
            var tokens = new List<Token>();
            
            while (_index < _length)
            {
                if (Current == TokenType.KWComponent)
                {
                    
                    _inContext = true;
                }
                else if (Current == TokenType.NEWLINE && Next != TokenType.INDENT)
                {
                    _inContext = false;
                }


                tokens.Add(Current);
                _index++;
            }
            return tokens;
        }
    }
}
