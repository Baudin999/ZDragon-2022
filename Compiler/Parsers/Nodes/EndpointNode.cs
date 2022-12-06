namespace Compiler.Parsers.Nodes;

public class EndpointNode : AttributesNode<ComponentAttribute>, IArchitectureNode
{
   
    public AstNode? Operation { get; }

    [JsonConstructor]
    public EndpointNode(
        Token idToken, 
        List<ComponentAttribute> attributes, 
        List<Token> extensionTokens, 
        List<Token> annotationTokens,
        AstNode? operation) :
        base(idToken, attributes, extensionTokens, annotationTokens)
    {
        Operation = operation;
    }
    
    
    public EndpointNode Clone(List<ComponentAttribute> newAttributes)
    {
        return new EndpointNode(
            this.IdToken.Clone(),
            newAttributes,
            this.ExtensionTokens.Select(a => a.Clone()).ToList(),
            this.AnnotationTokens.Select(a => a.Clone()).ToList(),
            this.Operation?.Clone()
        );
    }

    public override EndpointNode Clone()
    {
        return new EndpointNode(
            this.IdToken.Clone(),
            this.Attributes.Select(a => a.Clone()).ToList(),
            this.ExtensionTokens.Select(a => a.Clone()).ToList(),
            this.AnnotationTokens.Select(a => a.Clone()).ToList(),
            this.Operation?.Clone()
        );
    }
}