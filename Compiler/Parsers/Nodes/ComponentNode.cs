namespace Compiler.Parsers.Nodes
{
    public class ComponentNode : AstNode
    {
        public Token IdToken { get; }
        public string Id => IdToken.Value;
        public List<ComponentAttribute> Attributes { get; }
        public List<Token> Extends { get; }

        public ComponentNode(Token id, List<ComponentAttribute> attributes, List<Token> extensions)
        {
            this.IdToken = id;
            Attributes = attributes;
            Extends = extensions;
        }
    }

    public class ComponentAttribute
    {

        public Token IdToken { get; }
        public string Id => IdToken.Value;
        public Token ValueToken { get; }
        public string Value => ValueToken.Value.Trim();
        
        public List<string>? Items = null;
        public bool IsList => Items is not null;

        public ComponentAttribute(Token id, Token value)
        {
            this.IdToken = id;
            this.ValueToken = value;

            if (this.Value.StartsWith("-"))
            {
                // we have a list attribute
                Items = value
                    .Value
                    .Trim()
                    .Split("-")
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .ToList();
            }

            
        }
    }
}
