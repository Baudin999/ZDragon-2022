namespace Compiler.Parsers.Nodes;

public class VariableExpression : Expression, IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;

    public VariableExpression(Token idToken)
    {
        IdToken = idToken;
    }

    public override VariableExpression Clone()
    {
        return new VariableExpression(IdToken.Clone());
    }
    
    public string Hydrate()
    {
        return "Hydration not implemented";
    }
}