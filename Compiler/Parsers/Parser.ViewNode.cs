namespace Compiler.Parsers;

public partial class Parser
{
    private ViewNode? parseViewNode()
    {
        var kw = Take(TokenKind.KWView);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeArchitectureIdentifier("view");
        if (id is null) return null;

        If(TokenKind.Equal, () => Take());
        _ = TakeWhile(t => t == TokenKind.NEWLINE).ToList();

        var children = new List<ViewChildNode>();
        while (Current == TokenKind.START)
        {
            Take(TokenKind.START); // take the START
            var childId = Take(TokenKind.Word);
            _ = TakeWhile(t => t != TokenKind.END).ToList();
            Take(TokenKind.END);
            
            children.Add(new ViewChildNode(childId));
        }
        
        _ = TakeWhile(t => t != TokenKind.STOP_CONTEXT).ToList();
        
        return new ViewNode(id, children);
    }
}