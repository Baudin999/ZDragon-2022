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
        if (variables.Count > 0)
        {
            return parseFunctionNode(id, variables);
        }
        else
        {
            // just assignment of variable
            return new VariableNode(id);
        }
    }

    private AstNode? parseFunctionNode(Token id, List<Token> variables)
    {
        if (Is(TokenType.Equal))
        {
            _ = Take(TokenType.Equal);
            var body = parseImplementationBody();
            return new FunctionNode(id, variables, body);
        }

        return null;
    }

    private AstNode parseImplementationBody()
    {
        _ = Take(TokenType.START);
        var left = Take();
        var op = Take();
        var right = Take();
        _ = Take(TokenType.END);

        return new BinaryOperation(left, op, right);
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