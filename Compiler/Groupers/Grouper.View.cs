namespace Compiler.Groupers;

public partial class Grouper
{
    private void GroupView()
    {
        // group the component tokens
        // Do not do these checks
        // IsNot(TokenKind.KWComponent, () => throw new Exception("Invalid Token Kind"));
        
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
        
        If(TokenKind.Equal, () =>
        {
            // take the equals
            tokens.Add(Take());
            _ = TakeWhile(TokenKind.NEWLINE).ToList(); // remove the newlines
            
            
            // we are inside the body of the definition
            While(TokenKind.INDENT, TokenKind.SAMEDENT)
                .ContinueWith(() =>
                {
                    tokens.Add(Token.START_VIEW_FIELD);

                    If(TokenKind.INDENT, Forget);
                    If(TokenKind.SAMEDENT, Forget);

                    While(TokenKind.At, () =>
                    {
                        var annotation = TakeWhile(t => t != TokenKind.NEWLINE).Merge(TokenKind.Annotation);
                        if (annotation is not null) tokens.Add(annotation);
                        If(TokenKind.SAMEDENT, Forget);
                    });

                    var id = Append(TokenKind.Word); // take the field identifier
                    
                    If(TokenKind.Equal, () =>
                    {
                        Append(TokenKind.Equal); // take the equal

                        groupAttributes();

                        While(TokenKind.DEDENT, () =>
                        {
                            // Take();
                            MoveNext();
                            if (Next != TokenKind.DEDENT && Next != TokenKind.ROOT)
                                Current.Kind = TokenKind.SAMEDENT;
                            else
                                Take();
                        });

                    });
                    tokens.Add(Token.STOP_VIEW_FIELD);
                });
            
        });
        
        
        tokens.Add(Token.STOP_CONTEXT);
    }
}