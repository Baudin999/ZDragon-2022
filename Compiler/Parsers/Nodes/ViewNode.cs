namespace Compiler.Parsers.Nodes;

public class ViewNode : AstNode, IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;

    public List<ViewChildNode> Children; 
    
    public ViewNode(Token idToken, List<ViewChildNode> children)
    {
        this.IdToken = idToken;
        this.Children = children;
    }
}

public class ViewChildNode
{

    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    public List<ComponentAttribute> Attributes { get; }
    
    public ViewChildNode(Token idToken, List<ComponentAttribute> attributes)
    {
        this.IdToken = idToken;
        this.Attributes = attributes;
    }
}