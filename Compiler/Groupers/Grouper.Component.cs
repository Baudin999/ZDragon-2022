namespace Compiler.Groupers;

public partial class Grouper
{
    private void GroupComponent()
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
            
            groupAttributes();
        });
        
        
        tokens.Add(Token.STOP_CONTEXT);
    }

    private void groupAttributes()
    {
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
    }

    private void groupFieldValues()
    {
        var values = TakeWhileNot(TokenKind.NEWLINE).ToList();

        while (Current == TokenKind.NEWLINE && Next == TokenKind.NEWLINE) TakeCurrent();
        
        /* here we have multiple options. 
           Example 1:
           component Foo =
                Title: Foo
                Version: 12
            
            NELINE, SAMEDENT -> This is a new field
            NEWLINE, DEDENT -> Ends the properties
          
            Example 2:
            component Foo =
                Title: This is the 
                    Title over multiple lines
                Version: 12
            
            NEWLINE, INDENT ... DEDENT -> Take everything after the INDENT until the DEDENT
            
            
            Example 3:
            component Foo =
                Interactions:
                    - Bar
                    @ annotation
                    - Other
        
            NEWLINE, INDENT, (Minus || @) -> List item            
        
            Example 4:
            component Foo =
                Notes:
                    # This is a chapter
                    
                    And a paragraph
                    
                    * One
                    * Two
                        * Indented Two
                Version: 12
                
            NEWLINE, INDENT ... DEDENT  -> Ignore the subsequent INDENT, SAMEDENTS and DEDENTS.
        */
        
        


        // EXAMPLE 1: Check for SAMEDENT
        if (Current == TokenKind.NEWLINE && Next == TokenKind.SAMEDENT)
        {
            // we can finish this branch because 
        }
        else if (Current == TokenKind.NEWLINE && Next == TokenKind.INDENT && (Peek(2) == TokenKind.Minus || Peek(2) == TokenKind.At))
        {
            var annotations = new List<Token>();
            // list items
            TakeCurrent();
            while (Current != TokenKind.DEDENT && Current != TokenKind.EOF)
            {
                if (Current == TokenKind.At)
                {
                    annotations.Add(TakeWhileNot(TokenKind.NEWLINE).Merge(TokenKind.Annotation) ?? Token.EMPTY);
                }
                else if (Current == TokenKind.Minus)
                {
                    tokens.Add(Token.START_LIST_ITEM);
                    
                    // manage the annotations
                    tokens.AddRange(annotations);
                    annotations = new List<Token>();
                    
                    TakeCurrent(); // skip the minus token
                    while (Current != TokenKind.NEWLINE)
                        tokens.Add(TakeCurrent());
                    tokens.Add(Token.STOP_LIST_ITEM);
                }
                else
                {
                    TakeCurrent();
                }
            }
        }
        else if (Current == TokenKind.NEWLINE && Next == TokenKind.INDENT)
        {
            TakeCurrent();
            var indents = new Stack<Token>();
            indents.Push(TakeCurrent());
            while (indents.Count > 0 && Current != TokenKind.EOF)
            {
                if (Current == TokenKind.INDENT)
                {
                    indents.Push(Current);
                }
                else if (Current == TokenKind.DEDENT)
                {
                    indents.Pop();
                }
                
                if (indents.Count > 0)
                    values.Add(TakeCurrent());
            }
        }
        tokens.AddRange(values);
    }
}