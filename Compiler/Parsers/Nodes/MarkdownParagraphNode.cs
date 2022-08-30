namespace Compiler.Parsers.Nodes;


public class MarkdownParagraphNode : MarkdownNode
{
    private Token ValueToken { get; }
    public string Value => ValueToken.Value;
    
    [JsonConstructor]
    public MarkdownParagraphNode(Token valueToken)
    {
        ValueToken = valueToken;
    }
}