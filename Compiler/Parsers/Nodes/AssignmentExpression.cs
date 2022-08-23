namespace Compiler.Parsers.Nodes;

public class AssignmentExpression : AstNode
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;
    public Expression Body { get; }
    
    public AssignmentExpression(Token id, Expression body)
    {
        _idToken = id;
        Body = body;
    }
}