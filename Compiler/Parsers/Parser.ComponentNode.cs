namespace Compiler.Parsers
{
    public partial class Parser
    {
        private ComponentNode parseComponent()
        {
            var kw = Take(TokenType.KWComponent);
            var id = Take(TokenType.Word);
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
                    attributes.Add(parseComponentAttribute());
                }
            });

            return new ComponentNode(id, attributes, extensions);
        }

        private ComponentAttribute parseComponentAttribute()
        {
            Take(TokenType.START);
            var id = Take(TokenType.Word);
            var colon = Take(TokenType.Colon);

            var value = Take();
            if (value is null) throw new Exception("Invalid component value.");
            while (Current is not null && Current != TokenType.END)
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
    }
}
