namespace Compiler.Groupers;

public partial class Grouper 
{
    private void GroupParagraph()
    {
        tokens.Add(Token.START_CONTEXT);
        tokens.Add(Take(TokenKind.KWParagraph));

        Reduce();
        
        // group the style items:
        If(TokenKind.LeftBracket, () =>
        {
            var openStyles = Take();
            openStyles.Kind = TokenKind.OpenStyles;
            tokens.Add(openStyles);
            
            Reduce();

            while (!Is(TokenKind.RightBracket))
            {
                tokens.Add(TakeCurrent());
                Reduce(true);
            }
            
            If(TokenKind.RightBracket, () =>
            {
                tokens.Add(Take().Transform(TokenKind.CloseStyles));
            });
        });
        
        Reduce();
        
        // group content items:
        If(TokenKind.LeftBrace, () =>
        {
            var openContent = Take();
            openContent.Kind = TokenKind.OpenContent;
            tokens.Add(openContent);
            
            Reduce();

            WhileNot(TokenKind.RightBrace)
                .ContinueWith(() =>
                {
                    // ignore silliness
                    if (Current == TokenKind.DEDENT || Current == TokenKind.INDENT || Current == TokenKind.SAMEDENT || Current == TokenKind.ROOT)
                    {
                        Take();
                    }

                    if (Current != TokenKind.RightBrace)
                    {
                        // take the actual meat and bones
                        tokens.Add(TakeCurrent());
                    }
                });

            Reduce();
            
            If(TokenKind.RightBrace, () =>
            {
                tokens.Add(Take().Transform(TokenKind.CloseContent));
            });
        });

        Reduce();
        
        tokens.Add(Token.END_CONTEXT);
    }
}