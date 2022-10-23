namespace Compiler.Parsers.Nodes;

public class MarkdownNode : AstNode
{
    public Token ValueToken { get; protected set; } = default!;
    public string Value => ValueToken.Value.Trim();
    public string Content { get; protected set; } = default!;
    public List<StyleElement> Styles { get; protected set; } = new List<StyleElement>();
}