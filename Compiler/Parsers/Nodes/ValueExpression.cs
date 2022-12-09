namespace Compiler.Parsers.Nodes;

public class ValueExpression : Expression, IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;

    public ValueExpression(Token idToken)
    {
        IdToken = idToken;
    }

    public override ValueExpression Clone()
    {
        return new ValueExpression(IdToken.Clone());
    }
    
    public string Hydrate()
    {
        return "Hydration not implemented";
    }
}