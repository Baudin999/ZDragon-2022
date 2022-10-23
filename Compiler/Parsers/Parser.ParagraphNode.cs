namespace Compiler.Parsers;

public partial class Parser
{
    public MarkdownParagraphNode parseParagraphNode()
    {
        Take(TokenKind.KWParagraph);
        
        // parse the styles
        var styles = parseStyles();
        var contentToken = parseContent();

        Take(TokenKind.END_CONTEXT);

        if (contentToken is null) throw new Exception("Something went wrong");

        return new MarkdownParagraphNode(contentToken, styles);
    }

}