namespace Compiler.Parsers
{
    public partial class Parser
    {
        private ComponentNode parseComponent()
        {
            var kw = Take(TokenType.KWComponent);
            var id = Take(TokenType.Word);
            var attributes = new List<ComponentAttribute>();

            if (!If(TokenType.Equal))
            {
                // there is no equal token, so there is no reason to 
                // continue down this path.
                return new ComponentNode(id, attributes);
            }

            var equalsToken = Take(TokenType.Equal);

            while (If(TokenType.START))
            {
                attributes.Add(parseComponentAttribute());
            }

            return new ComponentNode(id, attributes);
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
