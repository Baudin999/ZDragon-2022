namespace Compiler.Parsers.Nodes;

public interface IAttributesNode : IIdentifier
{
    string Description { get;  }
}

public class AttributesNode<T> : AstNode, IAttributesNode where T : IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public List<T> Attributes { get; }
        
    public List<Token> ExtensionTokens { get; }
    public List<string> Extensions { get; }
        
    public List<Token> AnnotationTokens { get; }
        
    public string Description { get; } 

    [JsonConstructor]
    public AttributesNode(Token idToken, List<T> attributes, List<Token> extensionTokens, List<Token> annotationTokens)
    {
        this.IdToken = idToken;
        Attributes = attributes;
        ExtensionTokens = extensionTokens;
        AnnotationTokens = annotationTokens;
        
        Description = Helpers.DescriptionFromAnnotations(annotationTokens);
        Extensions = ExtensionTokens.Where(e => e == TokenKind.Word).Select(e => e.Value).ToList();
    }

    public bool ContainsAttribute(string id)
    {
        return Attributes.FirstOrDefault(a => a.Id == id) is not null;
    }

    public T? GetAttribute(string id)
    {
        return Attributes.FirstOrDefault(a => a.Id == id);
    }
}