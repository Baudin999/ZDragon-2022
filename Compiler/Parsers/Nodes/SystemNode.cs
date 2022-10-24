namespace Compiler.Parsers.Nodes;

public class SystemNode : AttributesNode<ComponentAttribute>
{
    // public Token IdToken { get; }
    // public string Id => IdToken.Value;
    // public List<ComponentAttribute> Attributes { get; }
    // public List<Token> Extends { get; }

    public SystemNode(Token isToken, List<ComponentAttribute> attributes, List<Token> extensionTokens, List<Token> annotationTokens) :
        base(isToken, attributes, extensionTokens, annotationTokens)
    {
        // this.IdToken = id;
        // Attributes = attributes;
        // Extends = extensions;
    }
    
    public SystemNode Clone(List<ComponentAttribute>? newAttributes = null)
    {
        return new SystemNode(
            this.IdToken.Clone(),
            newAttributes ?? this.Attributes.Select(a => a.Clone()).ToList(),
            this.ExtensionTokens.Select(a => a.Clone()).ToList(),
            this.AnnotationTokens.Select(a => a.Clone()).ToList()
        );
    }
}
