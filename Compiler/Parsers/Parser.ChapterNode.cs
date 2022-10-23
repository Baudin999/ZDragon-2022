namespace Compiler.Parsers;

public partial class Parser
{
    public MarkdownChapterNode parseChapterNode()
    {
        Take(TokenKind.KWChapter);
        
        // parse the styles
        var styles = parseStyles();
        var contentToken = parseContent();

        Take(TokenKind.END_CONTEXT);

        if (contentToken is null) throw new Exception("Something went wrong");

        return new MarkdownChapterNode(contentToken, styles);
    }


    private List<StyleElement> parseStyles()
    {
        Take(TokenKind.OpenStyles);

        var elements = new List<StyleElement>();
        
        if (Current == TokenKind.Word)
        {
            elements.Add(parseStyleElement());
        }

        while (Is(TokenKind.SemiColon))
        {
            Take(TokenKind.SemiColon);
            
            if (!Is(TokenKind.CloseStyles))
                elements.Add(parseStyleElement());
        }
        
        Take(TokenKind.CloseStyles);

        return elements;
    }

    private StyleElement parseStyleElement()
    {
        var key = TakeWhileNot(TokenKind.Colon).Merge(TokenKind.Word);
        Take(TokenKind.Colon);
        var value = TakeWhileNot(t =>
        {
            return t != TokenKind.SemiColon && t != TokenKind.CloseStyles;
        }).Merge(TokenKind.Word);

        if (key is null || value is null) throw new Exception("Something went wrong");
        
        return new StyleElement(key, value);
    }

    private Token? parseContent()
    {
        Take(TokenKind.OpenContent);
        var content = TakeWhileNot(TokenKind.CloseContent).Merge(TokenKind.Word);
        Take(TokenKind.CloseContent);

        return content;
    }
}