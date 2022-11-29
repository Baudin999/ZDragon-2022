namespace Compiler.Parsers;

public partial class Parser
{
    private DataNode? parseDataDefinition()
    {
        var kw = Take(TokenKind.KWData);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeIdentifier("data");
        var fields = new List<DataFieldNode>();
        if (id is null) return null;

        If(TokenKind.Equal, () =>
        {
            _ = Take(TokenKind.Equal);
            while (Is(TokenKind.START))
            {
                // silly hack where we get empty START-END combinations when we 
                // have empty lines between record fields.
                // TODO: Fix this bug in the lexer and grouper
                if (Next == TokenKind.NEWLINE && Peek(2) == TokenKind.END)
                {
                    Take();
                    Take();
                    continue;
                }
                
                var field = parseDataFieldNode();
                if (field is not null) fields.Add(field);

                If(TokenKind.END, () => Take());
            }
        });

        If(TokenKind.END_CONTEXT, () => Take(TokenKind.END_CONTEXT));
        return new DataNode(id, fields, annotations);
    }

    private DataFieldNode? parseDataFieldNode()
    {
        Take(TokenKind.START);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        Take(TokenKind.Or);
        var typeDefinition = TakeWhile(TokenKind.Word).ToList();
        Take(TokenKind.END);
        return new DataFieldNode(typeDefinition, annotations);
    } 

    
}