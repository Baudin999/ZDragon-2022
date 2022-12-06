namespace Compiler.Parsers.Nodes;

public class StringLiteralExpression : ValueExpression
{
    private Token ValueToken { get; }
    public string Value => ValueToken.Value;
    
    public StringLiteralExpression(Token valueToken) : base(valueToken)
    {
        ValueToken = valueToken;
    }
}