namespace Compiler.Parsers
{
    public partial class Parser
    {
        private ComponentNode? parseComponent()
        {
            var kw = Take(TokenType.KWComponent);
            var id = TakeComponentIdentifier();
            if (id is null) return null;

            var attributes = new List<ComponentAttribute>();
            var extensions = new List<Token>();

            // parse the extensions
            If(TokenType.KWExtends, () =>
            {
                _ = Take(TokenType.KWExtends);
                extensions.AddRange(TakeWhile(TokenType.Word).ToList());
            });

            // parse the body of the component
            If(TokenType.Equal, () =>
            {
                _ = Take(TokenType.Equal);
                while (Is(TokenType.START))
                {
                    var attribute = parseComponentAttribute();
                    if (attribute is not null)
                        attributes.Add(attribute);
                }
            });

            return new ComponentNode(id, attributes, extensions);
        }

        private ComponentAttribute? parseComponentAttribute()
        {
            Take(TokenType.START);
            var id = Take(TokenType.Word);
            var colon = Take(TokenType.Colon);

            var value = TakeNext();
            if (value is null) throw new Exception("Invalid component value.");
            Stack<Token> depth = new Stack<Token>();
            while (!(Current == TokenType.END && depth.Count == 0))
            {
                if (Current == TokenType.START)
                {
                    depth.Push(TakeNext());
                }
                else if (Current == TokenType.END)
                {
                    TakeNext();
                    depth.Pop();
                }
                else
                {
                    value.Append(TakeNext());
                }
            }

            // there could have been multiple indentations, these
            // result in multiple ends.
            while (Current == TokenType.END)
                Take(TokenType.END);

            return new ComponentAttribute(id, value);
        }

        private Token? TakeComponentIdentifier()
        {
            var id = Take(TokenType.Word, @"A component should have an Identifier to name the component, for example:

component Foo

Where 'Foo' is the identifier of the component.");

            return id != TokenType.Word ? null : id;
        }
    }
}
