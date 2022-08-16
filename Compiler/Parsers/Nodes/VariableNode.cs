namespace Compiler.Parsers.Nodes;

public class VariableNode : AstNode
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;

    public VariableNode(Token idToken)
    {
        _idToken = idToken;
    }
}