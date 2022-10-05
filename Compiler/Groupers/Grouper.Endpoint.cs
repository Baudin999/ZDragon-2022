namespace Compiler.Groupers;

public partial class Grouper
{
    private void GroupEndpoint()
    {
        
        tokens.Add(Token.START_CONTEXT);
        tokens.Add(Current);
        // the annotations come after the keyword because the parser
        // checks the keyword before going into the specific sub-parser
        tokens.AddRange(annotations);
        annotations = new List<Token>();
        _index++;

        
        If(TokenKind.Word, 
            () => tokens.Add(Take().Transform(TokenKind.Identifier)));

        If("extends", () =>
        {
            tokens.Add(Take().Transform(TokenKind.KWExtends));
            var extensions = TakeWhile(TokenKind.Word).Select(t => t.Transform(TokenKind.Identifier));
            tokens.AddRange(extensions);
        });

        If(TokenKind.Colon, () =>
        {
            tokens.AddRange(TakeWhileNot(t => t != TokenKind.NEWLINE && t != TokenKind.Equal).ToList());
        });
        
        If(TokenKind.Equal, () =>
        {
            // take the equals
            tokens.Add(Take());
            _ = TakeWhile(TokenKind.NEWLINE).ToList(); // remove the newlines
            
            
            // we are inside the body of the definition
            While(TokenKind.INDENT, TokenKind.SAMEDENT)
                .ContinueWith(() =>
                {
                    tokens.Add(Token.START);

                    If(TokenKind.INDENT, Forget);
                    If(TokenKind.SAMEDENT, Forget);

                    While(TokenKind.At, () =>
                    {
                        var annotation = TakeWhile(t => t != TokenKind.NEWLINE).Merge(TokenKind.Annotation);
                        if (annotation is not null) tokens.Add(annotation);
                        If(TokenKind.SAMEDENT, Forget);
                    });

                    var id = Append(TokenKind.Word); // take the field identifier
                    Append(TokenKind.Colon); // take the colon

                    groupFieldValues();

                    If(TokenKind.DEDENT, () =>
                    {
                        if (Next != TokenKind.DEDENT)
                            Current.Kind = TokenKind.SAMEDENT;
                    });

                    tokens.Add(Token.END);
                });
            
        });
        
        
        tokens.Add(Token.STOP_CONTEXT);
    }
}