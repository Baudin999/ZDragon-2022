namespace Compiler.Parsers.Nodes;

public class ViewNode : AstNode, IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;

    public List<ViewChildNode> Children; 
    
    public List<Token> ExtensionTokens { get; }
    public List<string> Extensions { get; }
    
    [JsonConstructor]
    public ViewNode(Token idToken, List<ViewChildNode> children, List<Token> extensionTokens)
    {
        this.IdToken = idToken;
        this.Children = children;
        this.ExtensionTokens = extensionTokens;
        this.Extensions = extensionTokens.Select(t => t.Value).ToList();
    }

    public ViewChildNode? GetChild(string id)
    {
        return this.Children.FirstOrDefault(c => c.Id == id);
    }

    public ViewChildNode AddChild(ViewChildNode childNode)
    {
        if (GetChild(childNode.Id) is null)
            Children.Add(childNode);

        return childNode;
    }

    public override ViewNode Clone()
    {
        return new ViewNode(
            IdToken.Clone(), 
            Children.Select(c => (ViewChildNode)c.Clone()).ToList(), 
            ExtensionTokens.Select(e => e.Clone()).ToList()
        );
    }
    
    public string Hydrate()
    {
        return "Hydration not implemented";
    }
}

public class ViewChildNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    public List<ComponentAttribute> Attributes { get; }
    
    public ViewChildNode(Token idToken, List<ComponentAttribute> attributes)
    {
        this.IdToken = idToken;
        this.Attributes = attributes;
    }

    public bool HasAttribute(string attributeId)
    {
        return Attributes.Find(a => a.Id == attributeId) is not null;
    }

    public override AstNode Clone()
    {
        return new ViewChildNode(
            IdToken.Clone(), 
            Attributes.Select(a => a.Clone()).ToList()
        );
    }
}