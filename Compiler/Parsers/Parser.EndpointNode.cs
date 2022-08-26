namespace Compiler.Parsers;

public partial class Parser
{
    private EndpointNode? parseEndpoint()
    {
        var kw = Take(TokenType.KWEndpoint);
        var annotations = TakeWhile(TokenType.Annotation).ToList();
        var id = TakeArchitectureIdentifier("endpoint");
        if (id is null) return null;

        var attributes = new List<ComponentAttribute>();
        var extensions = new List<Token>();
        AstNode? operation = null;

        // parse the extensions
        If(TokenType.KWExtends, () =>
        {
            _ = Take(TokenType.KWExtends);
            extensions.AddRange(TakeWhile(TokenType.Word).ToList());
        });
        
        If(TokenType.Colon, () =>
        {
            _ = Take(TokenType.Colon);
            _ = Take(TokenType.Colon);
            
            operation = parseTypeDefinitionBody();
        });

        // parse the body of the component
        parseAchitectureBody(attributes);

        return new EndpointNode(id, attributes, extensions, operation);
    }
}