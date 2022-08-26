namespace Compiler.Parsers.Nodes;

public class VariableExpression : Expression
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;

    public VariableExpression(Token idToken)
    {
        _idToken = idToken;
    }
}