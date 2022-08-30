namespace Compiler.Parsers.Nodes
{
    public class ComponentNode : AttributesNode<ComponentAttribute>
    {
      
        [JsonConstructor]
        public ComponentNode(Token idToken, List<ComponentAttribute> attributes, List<Token> extensionTokens,
            List<Token> annotationTokens) :
            base(idToken, attributes, extensionTokens, annotationTokens)
        {
        }

        
        
        
    }
}
