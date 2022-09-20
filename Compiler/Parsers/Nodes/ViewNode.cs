namespace Compiler.Parsers.Nodes;

public class ViewNode : AstNode
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
    
    public ViewChildNode(Token idToken)
    {
        this.IdToken = idToken;
    }
}