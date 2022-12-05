namespace Compiler.Parsers.Nodes;

public class BinaryOperationExpression : Expression
{
    public Expression Left { get; }
    public Token Op { get; }
    public Expression Right { get; }

    public BinaryOperationExpression(Expression? left, Token op, Expression right)
    {
        Left = left ?? throw new InvalidOperationException();
        Op = op;
        Right = right;
    }

    public override BinaryOperationExpression Clone()
    {
        return new BinaryOperationExpression((Expression)Left.Clone(), Op.Clone(), (Expression)Right.Clone());
    }
}