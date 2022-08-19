namespace Compiler.Parsers.Nodes;

public class EndpointNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public List<ComponentAttribute> Attributes { get; }
    public List<Token> Extends { get; }

    public EndpointNode(Token id, List<ComponentAttribute> attributes, List<Token> extensions)
    {
        this.IdToken = id;
        Attributes = attributes;
        Extends = extensions;
    }
}