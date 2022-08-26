namespace Compiler.Parsers.Nodes;

public class EndpointNode : AttributesNode<ComponentAttribute>
{
   
    public AstNode? Operation { get; }

    public EndpointNode(
        Token idToken, 
        List<ComponentAttribute> attributes, 
        List<Token> extensions, 
        List<Token> annotations,
        AstNode? operation) :
        base(idToken, attributes, extensions, annotations)
    {
        Operation = operation;
    }
}