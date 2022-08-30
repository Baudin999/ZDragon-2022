namespace Compiler.Parsers.Nodes;

public class NumberLiteralExpression : ValueExpression
{
    public Token ValueToken { get; }
    public string Value => ValueToken.Value;
    
    public NumberLiteralExpression(Token valueToken) : base(valueToken)
    {
        ValueToken = valueToken;
    }
}