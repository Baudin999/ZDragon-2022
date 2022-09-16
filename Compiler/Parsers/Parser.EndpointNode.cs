namespace Compiler.Parsers;

public partial class Parser
{
    private EndpointNode? parseEndpoint()
    {
        var kw = Take(TokenKind.KWEndpoint);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeArchitectureIdentifier("endpoint");
        if (id is null) return null;

        var attributes = new List<ComponentAttribute>();
        var extensions = new List<Token>();
        AstNode? operation = null;

        // parse the extensions
        If(TokenKind.KWExtends, () =>
        {
            _ = Take(TokenKind.KWExtends);
            extensions.AddRange(TakeWhile(TokenKind.Word).ToList());
        });
        
        If(TokenKind.Colon, () =>
        {
            _ = Take(TokenKind.Colon);
            _ = Take(TokenKind.Colon);
            
            operation = parseTypeDefinitionBody();
        });
        
        // parse the body of the component
        parseAchitectureBody(attributes);

        return new EndpointNode(id, attributes, extensions, annotations, operation);
    }
}