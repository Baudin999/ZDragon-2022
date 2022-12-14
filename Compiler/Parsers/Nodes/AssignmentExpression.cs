namespace Compiler.Parsers.Nodes;

public class AssignmentExpression : AstNode, IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public Expression Body { get; }
    
    public AssignmentExpression(Token id, Expression body)
    {
        IdToken = id;
        Body = body;
    }

    public override AssignmentExpression Clone()
    {
        return new AssignmentExpression(IdToken.Clone(), (Expression) Body.Clone());
    }

    public string Hydrate()
    {
        return "Hydration not implemented";
    }
}