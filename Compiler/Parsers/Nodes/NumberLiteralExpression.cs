namespace Compiler.Parsers.Nodes;

public class NumberLiteralExpression : ValueExpression
{
    public Token ValueTokenToken { get; }
    public string Value => ValueTokenToken.Value;
    
    public NumberLiteralExpression(Token valueTokenToken) : base(valueTokenToken)
    {
        ValueTokenToken = valueTokenToken;
    }
}