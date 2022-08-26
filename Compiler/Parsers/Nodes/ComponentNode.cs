namespace Compiler.Parsers.Nodes
{
    public class ComponentNode : AttributesNode<ComponentAttribute>
    {
      
        public ComponentNode(Token id, List<ComponentAttribute> attributes, List<Token> extensions,
            List<Token> annotationTokens) :
            base(id, attributes, extensions, annotationTokens)
        {
        }

    }
}
