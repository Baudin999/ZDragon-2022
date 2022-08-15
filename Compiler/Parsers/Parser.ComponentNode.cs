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
                while (If(TokenType.START))
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

            var value = Take();
            if (value is null) throw new Exception("Invalid component value.");
            while (Current != TokenType.END)
            {
                if (Current == TokenType.START) Take();
                value.Append(Take());
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
