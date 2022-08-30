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
}
