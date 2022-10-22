namespace Compiler.Parsers;

public partial class Parser
{
    private ViewNode? parseViewNode()
    {
        var kw = Take(TokenKind.KWView);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeArchitectureIdentifier("view");
        if (id is null) return null;

        var extensions = new List<Token>();
        parseExtensions(extensions, id);
        
        If(TokenKind.Equal, () => Take());
        _ = TakeWhile(t => t == TokenKind.NEWLINE).ToList();
        
        var children = new List<ViewChildNode>();
        while (Current == TokenKind.START_VIEW_FIELD)
        {
            Take(TokenKind.START_VIEW_FIELD); // take the START
            var childId = Take(TokenKind.Word);
            var attributes = new List<ComponentAttribute>();
            If(TokenKind.Equal, () =>
            {
                attributes = new List<ComponentAttribute>();
                parseAchitectureBody(attributes);
            });
            
            _ = TakeWhile(t => t != TokenKind.END_VIEW_FIELD).ToList();
            Take(TokenKind.END_VIEW_FIELD);
            
            children.Add(new ViewChildNode(childId, attributes));
        }
        
        _ = TakeWhile(t => t != TokenKind.END_CONTEXT).ToList();
        
        return new ViewNode(id, children, extensions);
    }
}