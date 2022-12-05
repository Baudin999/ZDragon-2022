namespace Compiler.Parsers.Nodes;

public class MarkdownNode : AstNode
{
    public Token ValueToken { get; protected set; } = default!;
    public string Value => ValueToken.Value.Trim();
    public string Content { get; protected set; } = default!;
    public List<StyleElement> Styles { get; protected set; } = new List<StyleElement>();

    public override AstNode Clone()
    {
        var node = new MarkdownNode();
        node.ValueToken = ValueToken;
        node.Content = Content;
        node.Styles = Styles;
        return node;
    }
}