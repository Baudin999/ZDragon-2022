namespace Compiler.Parsers;

public partial class Parser
{
    public TypeDefinitionNode? parseTypeDefinition()
    {
        _ = Take(TokenType.KWType);
        var id = TakeTypeDefinitionIdentifier();
        if (id == null) return null;
        _ = Take(TokenType.Equal);
        
        // parse the body of the type definition
        var body = parseTypeDefinitionBody();
        
        return new TypeDefinitionNode(id, body);
    }

    private AstNode parseTypeDefinitionBody()
    {
        var parameters = new List<AstNode>();

        while (Current != TokenType.STOP_CONTEXT)
        {
            if (If(TokenType.Word)) parameters.Add(parseTypeDefinitionBodyWithWord());
            else if (If(TokenType.LeftParen)) {parameters.Add(parseNestedDefinition());}
            else if (If(TokenType.Next))
            {
                return parseFunctionApplication(parameters[0]);
            }
            else
            {
                return parameters[0];
            }
        }

        return parameters[0];
    }

    private AstNode parseTypeDefinitionBodyWithWord()
    {
        var parameters = TakeWhile(TokenType.Word).ToList();
        return parameters.Count switch
        {
            0 => throw new Exception("Expected at least one parameter"),
            1 => new IdentifierNode(parameters[0]),
            _ => new TypeApplicationNode(parameters[0], parameters.Skip(1).ToArray())
        };
    }

    private AstNode parseNestedDefinition()
    {
        _ = Take(TokenType.LeftParen);
        var body = parseTypeDefinitionBody();
        _ = Take(TokenType.RightParen);

        return body;
    }
    
    private AstNode parseFunctionApplication(AstNode astNode)
    {
        var parameters = new List<AstNode> {astNode};
        while (If(TokenType.Next))
        {
            Take(TokenType.Next);
            var nextParam = parseTypeDefinitionBody();
            if(If(TokenType.LeftParen)) parameters.Add(nextParam);
            else
            {
                if (nextParam is FunctionApplicationNode fdn)
                    parameters.AddRange(fdn.Parameters);
                else 
                    parameters.Add(nextParam);
            }
        }

        return new FunctionApplicationNode(parameters);
    }

    private Token? TakeTypeDefinitionIdentifier()
    {
        var id = Take(TokenType.Word, @"A type should always have an identifier:

type Add = Int -> Int -> Int;
");

        return id != TokenType.Word ? null : id;
    }
}