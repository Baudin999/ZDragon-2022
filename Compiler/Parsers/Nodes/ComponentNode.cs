namespace Compiler.Parsers.Nodes
{
    public class ComponentNode : AstNode
    {
        public Token IdToken { get; }
        public string Id => IdToken.Value;
        public List<ComponentAttribute> Attributes { get; }

        public ComponentNode(Token id, List<ComponentAttribute> attributes)
        {
            this.IdToken = id;
            Attributes = attributes;
        }

    }

    public class ComponentAttribute
    {

        public Token IdToken { get; }
        public string Id => IdToken.Value;
        public Token ValueToken { get; }
        public string Value => ValueToken.Value;

        public ComponentAttribute(Token id, Token value)
        {
            this.IdToken = id;
            this.ValueToken = value;
        }
    }
}
