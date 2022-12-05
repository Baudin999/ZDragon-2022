namespace Compiler.Parsers.Nodes;

public class BinaryExpression : Expression
{
    public Expression Left { get; }
    public Expression Right { get; }

    public BinaryExpression(Expression left, Expression right)
    {
        Left = left;
        Right = right;
    }

    public override BinaryExpression Clone()
    {
        return new BinaryExpression((Expression)Left.Clone(), (Expression)Right.Clone());
    }
}