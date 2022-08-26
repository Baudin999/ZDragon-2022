namespace Compiler.Parsers;

public partial class Parser
{
    private RecordNode? parseRecordDefinition()
    {

        
        var kw = Take(TokenType.KWRecord);
        var annotations = TakeWhile(TokenType.Annotation).ToList();
        var id = TakeArchitectureIdentifier("record");
        var fields = new List<RecordFieldNode>();
        if (id is null) return null;
        
        
        
        If(TokenType.Equal, () =>
        {
            _ = Take(TokenType.Equal);
            while (Is(TokenType.START))
            {
                var field = parseRecordFieldNode();
                if (field is not null) fields.Add(field);
                Take(TokenType.END);
            }
        });


        return new RecordNode(id, fields, annotations);
    }

    private RecordFieldNode? parseRecordFieldNode()
    {
        //
        _ = Take(TokenType.START);
        var annotations = TakeWhile(TokenType.Annotation).ToList();
        
        var id = Take(TokenType.Word);
        var colon = Take(TokenType.Colon);
        var type = TakeWhile(TokenType.Word).ToList();

        return new RecordFieldNode(id, type, annotations);
    }
}