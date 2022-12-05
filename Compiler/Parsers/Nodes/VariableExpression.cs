namespace Compiler.Parsers.Nodes;

public class VariableExpression : Expression, IIdentifier
{
    private readonly Token IdToken;
    public string Id => IdToken.Value;

    public VariableExpression(Token idToken)
    {
        IdToken = idToken;
    }

    public override VariableExpression Clone()
    {
        return new VariableExpression(IdToken.Clone());
    }
}