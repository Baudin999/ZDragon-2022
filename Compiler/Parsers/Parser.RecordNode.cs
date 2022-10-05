namespace Compiler.Parsers;

public partial class Parser
{
    private RecordNode? parseRecordDefinition()
    {
        var kw = Take(TokenKind.KWRecord);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeIdentifier("record");
        var fields = new List<RecordFieldNode>();
        if (id is null) return null;

        If(TokenKind.Equal, () =>
        {
            _ = Take(TokenKind.Equal);
            while (Is(TokenKind.START))
            {
                var field = parseRecordFieldNode();
                if (field is not null) fields.Add(field);
                Take(TokenKind.END);
            }
        });


        return new RecordNode(id, fields, annotations);
    }

    private RecordFieldNode? parseRecordFieldNode()
    {
        //
        _ = Take(TokenKind.START);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        
        var id = Take(TokenKind.Word);
        var colon = Take(TokenKind.Colon);
        var type = TakeWhile(TokenKind.Word).ToList();

        return new RecordFieldNode(id, type, annotations);
    }
    
    private Token? TakeIdentifier(string name)
    {
        var id = Take(TokenKind.Word, $@"A {name} should have an Identifier to name the {name}, for example:

{name} Foo

Where 'Foo' is the identifier of the {name}.");

        return id != TokenKind.Word ? null : id;
    }
}