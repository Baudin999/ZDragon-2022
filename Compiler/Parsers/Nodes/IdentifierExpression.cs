namespace Compiler.Parsers.Nodes;

public class IdentifierExpression : Expression
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    public IdentifierExpression(Token id)
    {
        IdToken = id;
    }

    public override IdentifierExpression Clone()
    {
        return new IdentifierExpression(IdToken.Clone());
    }
}