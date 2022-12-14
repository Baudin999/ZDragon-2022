namespace Compiler.Parsers.Nodes;

public class OperatorExpression : Expression
{
    public Token Op { get; }

    public OperatorExpression(Token op)
    {
        Op = op;
    }

    public override OperatorExpression Clone()
    {
        return new OperatorExpression(Op.Clone());
    }
}