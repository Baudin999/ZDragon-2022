namespace Compiler.Parsers.Nodes;

public class ValueExpression : Expression, IIdentifier
{
    public readonly Token IdTokenToken;
    public string Id => IdTokenToken.Value;

    public ValueExpression(Token idTokenToken)
    {
        IdTokenToken = idTokenToken;
    }

    public override ValueExpression Clone()
    {
        return new ValueExpression(IdTokenToken.Clone());
    }
}