namespace Compiler.Parsers.Nodes;

public class MarkdownChapterNode : MarkdownNode
{
    public Token ValueToken { get; }
    public string Value => ValueToken.Value;
    
    [JsonConstructor]
    public MarkdownChapterNode(Token valueToken)
    {
        ValueToken = valueToken;
    }
}
