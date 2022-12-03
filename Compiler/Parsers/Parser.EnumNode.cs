namespace Compiler.Parsers;

public partial class Parser
{
    private EnumNode? parseEnumNode()
    {
        var kw = Take(TokenKind.KWEnum);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeIdentifier("enum");
        var fields = new List<EnumFieldNode>();
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
                
                var field = parseEnumFieldNode();
                if (field is not null) fields.Add(field);

                If(TokenKind.END, () => Take());
            }
        });

        If(TokenKind.END_CONTEXT, () => Take(TokenKind.END_CONTEXT));
        return new EnumNode(id, fields, annotations);
    }

    private EnumFieldNode? parseEnumFieldNode()
    {
        Take(TokenKind.START);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        Take(TokenKind.Or);
        var value = Take(TokenKind.String);
        Take(TokenKind.END);
        return new EnumFieldNode(value, annotations);
    } 

}