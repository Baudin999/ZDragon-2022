namespace Compiler.Parsers.Nodes;

public class StringLiteralExpression : ValueExpression
{
    private Token _value { get; }
    public string Value => _value.Value;
    
    public StringLiteralExpression(Token valueToken) : base(valueToken)
    {
        _value = valueToken;
    }
}