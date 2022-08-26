namespace Compiler.Parsers.Nodes;

public class NumberLiteralExpression : ValueExpression
{
    private Token _value { get; }
    public string Value => _value.Value;
    
    public NumberLiteralExpression(Token valueToken) : base(valueToken)
    {
        _value = valueToken;
    }
}