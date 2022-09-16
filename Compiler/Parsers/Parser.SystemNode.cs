namespace Compiler.Parsers;

public partial class Parser
{
    private SystemNode? parseSystem()
    {
        var kw = Take(TokenKind.KWSystem);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeArchitectureIdentifier("system");
        if (id is null) return null;

        var attributes = new List<ComponentAttribute>();
        var extensions = new List<Token>();

        // parse the extensions
        If(TokenKind.KWExtends, () =>
        {
            _ = Take(TokenKind.KWExtends);
            extensions.AddRange(TakeWhile(TokenKind.Word).ToList());
        });

        parseAchitectureBody(attributes);

        return new SystemNode(id, attributes, extensions, annotations);
    }

    private void parseAchitectureBody(List<ComponentAttribute> attributes)
    {
        // parse the body of the component
        If(TokenKind.Equal,
            () =>
            {
                _ = Take(TokenKind.Equal);
                while (Is(TokenKind.START))
                {
                    var attribute = parseArchitectureAttribute();
                    if (attribute is not null)
                        attributes.Add(attribute);
                }
            }, () => { If(TokenKind.START, () => { Abort("Expected '=' after 'system'"); }); });
    }
}