namespace Compiler.Parsers.Nodes;

public class FunctionDefinitionNode : AstNode
{
    
    public List<AstNode> Parameters { get; }

    public FunctionDefinitionNode(List<AstNode> parameters)
    {
        Parameters = parameters;
    }   
}
