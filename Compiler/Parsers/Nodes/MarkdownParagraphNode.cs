namespace Compiler.Parsers.Nodes;


public class MarkdownParagraphNode : MarkdownNode
{
    private readonly Token _value;
    public string Value => _value.Value;
    
    public MarkdownParagraphNode(Token value)
    {
        _value = value;
    }
}