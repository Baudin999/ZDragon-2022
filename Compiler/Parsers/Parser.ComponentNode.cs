namespace Compiler.Parsers
{
    public partial class Parser
    {
        private ComponentNode? parseComponent()
        {
            var kw = Take(TokenKind.KWComponent);
            var annotations = TakeWhile(TokenKind.Annotation).ToList();
            var id = TakeArchitectureIdentifier("component");
            if (id is null) return null;

            var attributes = new List<ComponentAttribute>();
            var extensions = new List<Token>();

            // parse the extensions
            If(TokenKind.KWExtends, () =>
            {
                _ = Take(TokenKind.KWExtends);
                extensions.AddRange(TakeWhile(TokenKind.Word).ToList());
                foreach (var ext in extensions)
                {
                    References.Add(new NodeReference(id, ext, ReferenceType.ExtendedBy));
                }
            });

            // parse the body of the component
            parseAchitectureBody(attributes);

            return new ComponentNode(id, attributes, extensions, annotations);
        }

       

        private ComponentAttribute? parseArchitectureAttribute()
        {
            Take(TokenKind.START);
            var annotations = TakeWhile(TokenKind.Annotation).ToList();
            var id = Take(TokenKind.Word);
            var colon = Take(TokenKind.Colon);

            Token? value = null;
            List<Token> valueTokens = new List<Token>();
            var depth = new Stack<Token>();
            while (!(Current == TokenKind.END && depth.Count == 0))
            {
                
                if (Current == TokenKind.START)
                {
                    //value?.Add(Environment.NewLine);
                    for (int i = 0; i < depth.Count * 4; ++i)
                    {
                        // add spaces per indentation to the value
                        value?.Add(' ');
                    }
                    depth.Push(TakeNext());
                }
                else if (Current == TokenKind.SAMEDENT)
                {
                    value?.Add(Environment.NewLine);
                    TakeNext();
                }
                else if (Current == TokenKind.END)
                {
                    TakeNext();
                    depth.Pop();
                }
                else
                {
                    var _current = TakeNext().Clone();
                    if (_current == TokenKind.Word)
                    {
                        valueTokens.Add(_current);
                    }
                    if (value is null)
                    {
                        value = _current;
                    }
                    else
                    {
                        value?.Append(_current);
                    }
                }
            }

            // there could have been multiple indentations, these
            // result in multiple ends.
            while (Current == TokenKind.END)
                Take();

            return new ComponentAttribute(id, value ?? Token.EMPTY, valueTokens, annotations);
        }

        private Token? TakeArchitectureIdentifier(string name)
        {
            var id = Take(TokenKind.Word, $@"A {name} should have an Identifier to name the {name}, for example:

{name} Foo

Where 'Foo' is the identifier of the {name}.");

            return id != TokenKind.Word ? null : id;
        }
    }
}
