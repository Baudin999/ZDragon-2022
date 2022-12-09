namespace Compiler.Parsers.Nodes;

public class SystemNode : AttributesNode<ComponentAttribute>
{
    // public Token IdToken { get; }
    // public string Id => IdToken.Value;
    // public List<ComponentAttribute> Attributes { get; }
    // public List<Token> Extends { get; }

    public SystemNode(Token idToken, List<ComponentAttribute> attributes, List<Token> extensionTokens, List<Token> annotationTokens) :
        base(idToken, attributes, extensionTokens, annotationTokens)
    {
        // this.IdToken = id;
        // Attributes = attributes;
        // Extends = extensions;
    }
    
    public SystemNode Clone(List<ComponentAttribute> newAttributes)
    {
        return new SystemNode(
            this.IdToken.Clone(),
            newAttributes ?? this.Attributes.Select(a => a.Clone()).ToList(),
            this.ExtensionTokens.Select(a => a.Clone()).ToList(),
            this.AnnotationTokens.Select(a => a.Clone()).ToList()
        );
    }
    
    public override SystemNode Clone()
    {
        return new SystemNode(
            this.IdToken.Clone(),
            this.Attributes.Select(a => a.Clone()).ToList(),
            this.ExtensionTokens.Select(a => a.Clone()).ToList(),
            this.AnnotationTokens.Select(a => a.Clone()).ToList()
        );
    }
}
