namespace Compiler.Parsers.Nodes;

public class SystemNode : AttributesNode<ComponentAttribute>
{
    // public Token IdToken { get; }
    // public string Id => IdToken.Value;
    // public List<ComponentAttribute> Attributes { get; }
    // public List<Token> Extends { get; }

    public SystemNode(Token id, List<ComponentAttribute> attributes, List<Token> extensions, List<Token> annotationTokens) :
        base(id, attributes, extensions, annotationTokens)
    {
        // this.IdToken = id;
        // Attributes = attributes;
        // Extends = extensions;
    }
}
