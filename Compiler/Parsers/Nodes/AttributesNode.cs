namespace Compiler.Parsers.Nodes;

public interface IAttributesNode
{
    string Id { get; }
    string Description { get;  }
}

public class AttributesNode<T> : AstNode, IAttributesNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public List<T> Attributes { get; }
        
    public List<Token> ExtensionTokenTokens { get; }
        
    public List<Token> AnnotationTokens { get; }
        
    public string Description { get; } 

    [JsonConstructor]
    public AttributesNode(Token idToken, List<T> attributes, List<Token> extensionTokens, List<Token> annotationTokens)
    {
        this.IdToken = idToken;
        Attributes = attributes;
        ExtensionTokenTokens = extensionTokens;
        AnnotationTokens = annotationTokens;
        
        Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }
}