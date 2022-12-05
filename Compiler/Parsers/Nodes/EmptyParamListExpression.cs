namespace Compiler.Parsers.Nodes;

public class EmptyParamListExpression : Expression
{
    public EmptyParamListExpression()
    {
        
    }

    public override AstNode Clone()
    {
        return new EmptyParamListExpression();
    }
}