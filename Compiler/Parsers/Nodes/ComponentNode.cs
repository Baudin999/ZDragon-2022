namespace Compiler.Parsers.Nodes
{
    public class ComponentNode : AttributesNode<ComponentAttribute>, IArchitectureNode
    {
      
        [JsonConstructor]
        public ComponentNode(Token idToken, List<ComponentAttribute> attributes, List<Token> extensionTokens,
            List<Token> annotationTokens) :
            base(idToken, attributes, extensionTokens, annotationTokens)
        {
        }

        public ComponentNode Clone(List<ComponentAttribute>? newAttributes = null)
        {
            return new ComponentNode(
                this.IdToken.Clone(),
                newAttributes ?? this.Attributes.Select(a => a.Clone()).ToList(),
                this.ExtensionTokens.Select(a => a.Clone()).ToList(),
                this.AnnotationTokens.Select(a => a.Clone()).ToList()
            );
        }
    }
}
