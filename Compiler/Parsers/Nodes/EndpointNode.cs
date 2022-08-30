namespace Compiler.Parsers.Nodes;

public class EndpointNode : AttributesNode<ComponentAttribute>
{
   
    public AstNode? Operation { get; }

    public EndpointNode(
        Token isTokenToken, 
        List<ComponentAttribute> attributes, 
        List<Token> extensionTokens, 
        List<Token> annotations,
        AstNode? operation) :
        base(isTokenToken, attributes, extensionTokens, annotations)
    {
        Operation = operation;
    }
}