namespace Compiler.Parsers.Nodes;

public class OperationExpression : Expression
{
    public Token Op { get; }
    public Expression Right { get; }

    public OperationExpression(Token op, Expression right)
    {
        Op = op;
        Right = right;
    }

    public override OperationExpression Clone()
    {
        return new OperationExpression(
            Op.Clone(),
            (Expression)Right.Clone()
        );
    }
}