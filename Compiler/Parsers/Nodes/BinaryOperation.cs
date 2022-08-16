namespace Compiler.Parsers.Nodes;

public class BinaryOperation : AstNode
{
    public Token Left { get; }
    public Token Op { get; }
    public Token Right { get; }

    public BinaryOperation(Token left, Token op, Token right)
    {
        Left = left;
        Op = op;
        Right = right;
    }
}