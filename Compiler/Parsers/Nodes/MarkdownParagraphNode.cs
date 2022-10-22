namespace Compiler.Parsers.Nodes;


public class MarkdownParagraphNode : MarkdownNode
{ 
    [JsonConstructor]
    public MarkdownParagraphNode(Token valueToken)
    {
        ValueToken = valueToken;
        Content = Value;
    }
}