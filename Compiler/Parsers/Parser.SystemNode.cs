namespace Compiler.Parsers;

public partial class Parser
{
    private SystemNode? parseSystem()
    {
        var kw = Take(TokenType.KWSystem);
        var annotations = TakeWhile(TokenType.Annotation).ToList();
        var id = TakeArchitectureIdentifier("system");
        if (id is null) return null;

        var attributes = new List<ComponentAttribute>();
        var extensions = new List<Token>();

        // parse the extensions
        If(TokenType.KWExtends, () =>
        {
            _ = Take(TokenType.KWExtends);
            extensions.AddRange(TakeWhile(TokenType.Word).ToList());
        });

        parseAchitectureBody(attributes);

        return new SystemNode(id, attributes, extensions, annotations);
    }

    private void parseAchitectureBody(List<ComponentAttribute> attributes)
    {
        // parse the body of the component
        If(TokenType.Equal,
            () =>
            {
                _ = Take(TokenType.Equal);
                while (Is(TokenType.START))
                {
                    var attribute = parseArchitectureAttribute();
                    if (attribute is not null)
                        attributes.Add(attribute);
                }
            }, () => { If(TokenType.START, () => { Abort("Expected '=' after 'system'"); }); });
    }
}