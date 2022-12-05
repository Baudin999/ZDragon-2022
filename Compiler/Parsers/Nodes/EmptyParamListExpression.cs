namespace Compiler.Parsers.Nodes;

public class EmptyParamListExpression : Expression
{
    public EmptyParamListExpression()
    {
        
    }

    public override EmptyParamListExpression Clone()
    {
        return new EmptyParamListExpression();
    }
}