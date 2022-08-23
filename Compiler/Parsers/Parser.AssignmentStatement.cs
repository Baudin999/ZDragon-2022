namespace Compiler.Parsers;

public partial class Parser
{
    private AstNode? parseAssignmentStatement()
    {
        //
        var kw = Take(TokenType.KWLet);
        var id = TakeAssignmentIdentifier();
        if (id is null) return null;

        var variables = TakeWhile(TokenType.Word).ToList();
        If(TokenType.LeftParen, () =>
        {
            Take();
            Take(TokenType.RightParen);
            variables.Add(new Token(TokenType.EmptyParamList));
        });
        
        _ = Take(TokenType.Equal);

        If(TokenType.START, () => Take());
        
        if (variables.Count > 0)
        {
            return parseFunctionNode(id, variables);
        }
        else
        {
            // just assignment of variable
            var body = parseExpression();
            if (body is null)
            {
                Abort("Invalid assignment.");
                return null;
            }
            
            return new AssignmentExpression(id, body);
        }
    }

    private AstNode? parseFunctionNode(Token id, List<Token> variables)
    {
        var body = parseExpression();
        if (body is null)
        {
            Abort("Invalid function body");
            return null;
        }

        return new FunctionNode(id, variables, body);
    }

    

    private Expression? parseExpression()
    {
        if (Current == TokenType.LeftParen)
        {
            _ = Take(TokenType.LeftParen);
            var expression = parseExpression();
            if (expression is null)
                expression = new EmptyParamListExpression();
            _ = Take(TokenType.RightParen);
            return expression;
        }
        else
        {
            var head = takeExpression();
            if (head is null) return null;
            
            var tail = parseExpression();

            
            if (tail is null)
            {
                return head;
            }
            else if (head is OperatorExpression ope)
            {
                return new OperationExpression(ope.Op, tail);
            }
            else if (tail is OperationExpression operationExpression)
            {
                return new BinaryOperationExpression(head, operationExpression.Op, operationExpression.Right);
            }
            else if (head is ValueExpression)
            {
                return new BinaryExpression(head, tail);
            }
            else if (head is IdentifierExpression)
            {
                return new BinaryExpression(head, tail);
            }
        }
        
        return null;
    }

    public Expression? takeExpression()
    {
        var token = Take();
        if (IsOperator(token))
        {
            return new OperatorExpression(token);
        }
        else if (token == TokenType.Word)
        {
            return new IdentifierExpression(token);
        }
        else if (token == TokenType.Number)
        {
            return new NumberLiteralExpression(token);
        }
        else if (token == TokenType.String)
        {
            return new StringLiteralExpression(token);
        }
        else
        {
            return null;
        }
    }

    private Token? TakeAssignmentIdentifier()
    {
        var id = Take(TokenType.Word, @"An assignment should have an Identifier to name the varaible, for example:

let n = 2
let Add x y =
    x + y");

        return id != TokenType.Word ? null : id;
    }
}