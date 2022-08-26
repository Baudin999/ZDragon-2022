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


    public class AttributesNode<T> : AstNode
    {
        public Token IdToken { get; }
        public string Id => IdToken.Value;
        public List<T> Attributes { get; }
        
        public List<Token> Extends { get; }
        
        private List<Token> _annotationTokens;
        
        public readonly string Description; 

        public AttributesNode(Token id, List<T> attributes, List<Token> extensions, List<Token> annotationTokens)
        {
            this.IdToken = id;
            Attributes = attributes;
            Extends = extensions;
            _annotationTokens = annotationTokens;
            Description = Helpers.DescriptionFromAnnotations(annotationTokens);
        }
    }
}
