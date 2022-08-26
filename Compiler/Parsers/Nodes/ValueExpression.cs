namespace Compiler.Parsers.Nodes;

public class ValueExpression : Expression
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;

    public ValueExpression(Token idToken)
    {
        _idToken = idToken;
    }
}