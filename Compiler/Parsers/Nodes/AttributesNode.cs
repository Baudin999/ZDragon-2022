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
        
    public List<Token> Extends { get; }
        
    private List<Token> _annotationTokens;
        
    public string Description { get; } 

    public AttributesNode(Token id, List<T> attributes, List<Token> extensions, List<Token> annotationTokens)
    {
        this.IdToken = id;
        Attributes = attributes;
        Extends = extensions;
        _annotationTokens = annotationTokens;
        Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }
}