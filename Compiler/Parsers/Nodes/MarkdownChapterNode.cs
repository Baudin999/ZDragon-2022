namespace Compiler.Parsers.Nodes;

public class MarkdownChapterNode : MarkdownNode
{
    private readonly Token _value;
    public string Value => _value.Value;
    
    public MarkdownChapterNode(Token value)
    {
        _value = value;
    }
}
