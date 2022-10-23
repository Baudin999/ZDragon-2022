namespace Compiler.Parsers.Nodes;


public class MarkdownParagraphNode : MarkdownNode
{ 
    [JsonConstructor]
    public MarkdownParagraphNode(Token valueToken, List<StyleElement>? styleElements = null)
    {
        ValueToken = valueToken;
        Content = Value;
        if (styleElements is not null)
            this.Styles = styleElements;
    }
}