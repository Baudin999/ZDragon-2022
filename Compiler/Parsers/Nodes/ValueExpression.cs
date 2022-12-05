namespace Compiler.Parsers.Nodes;

public class ValueExpression : Expression, IIdentifier
{
    public readonly Token IdToken;
    public string Id => IdToken.Value;

    public ValueExpression(Token idToken)
    {
        IdToken = idToken;
    }

    public override ValueExpression Clone()
    {
        return new ValueExpression(IdToken.Clone());
    }
}