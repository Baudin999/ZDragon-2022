namespace Compiler.Parsers;

public partial class Parser
{
    private EndpointNode? parseEndpoint()
    {
        var kw = Take(TokenType.KWEndpoint);
        var id = TakeArchitectureIdentifier("endpoint");
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
                var attribute = parseArchitectureAttribute();
                if (attribute is not null)
                    attributes.Add(attribute);
            }
        });

        return new EndpointNode(id, attributes, extensions);
    }
}