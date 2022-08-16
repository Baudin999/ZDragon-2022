namespace Compiler.Parsers.Nodes;

public class VariableNode : AstNode
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;

    public VariableNode(Token idToken)
    {
        _idToken = idToken;
    }
}

public abstract class Expression : AstNode
{
}

public class ValueExpression : Expression
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;

    public ValueExpression(Token idToken)
    {
        _idToken = idToken;
    }
}

public class BinaryExpression : Expression
{
    public Expression Left { get; }
    public Expression Right { get; }

    public BinaryExpression(Expression left, Expression right)
    {
        Left = left;
        Right = right;
    }
}

public class FunctionApplicationExpression : Expression
{
    public Token Id { get; }
    public Expression Parameters { get; }

    public FunctionApplicationExpression(Token id, Expression parameters)
    {
        Id = id;
        Parameters = parameters;
    }
}

public class VariableExpression : Expression
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;

    public VariableExpression(Token idToken)
    {
        _idToken = idToken;
    }
}

public class OperationExpression : Expression
{
    public Token Op { get; }
    public Expression Right { get; }

    public OperationExpression(Token op, Expression right)
    {
        Op = op;
        Right = right;
    }
}

public class OperatorExpression : Expression
{
    public Token Op { get; }

    public OperatorExpression(Token op)
    {
        Op = op;
    }
}

public class EmptyParamListExpression : Expression
{
    public EmptyParamListExpression()
    {
        
    }
}

public class IdentifierExpression : Expression
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    public IdentifierExpression(Token id)
    {
        IdToken = id;
    }
}

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
