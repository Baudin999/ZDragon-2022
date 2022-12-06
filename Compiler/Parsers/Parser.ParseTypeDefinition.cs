namespace Compiler.Parsers;

public partial class Parser
{
    private TypeDefinitionNode? parseTypeDefinition()
    {
        _ = Take(TokenKind.KWType);
        var annotations = TakeWhile(TokenKind.Annotation).ToList();
        var id = TakeTypeDefinitionIdentifier();
        if (id == null) return null;
        _ = Take(TokenKind.Equal);
        
        // parse the body of the type definition
        var body = parseTypeDefinitionBody();
         
        return new TypeDefinitionNode(id, body);
    }

    private AstNode parseTypeDefinitionBody()
    {
        var parameters = new List<AstNode>();

        while (Current != TokenKind.END_CONTEXT)
        {
            if (Is(TokenKind.Word)) parameters.Add(parseTypeDefinitionBodyWithWord());
            else if (Is(TokenKind.LeftParen)) {parameters.Add(parseNestedDefinition());}
            else if (Is(TokenKind.Next))
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
        var parameters = TakeWhile(TokenKind.Word).ToList();
        return parameters.Count switch
        {
            0 => throw new Exception("Expected at least one parameter"),
            1 => new IdentifierNode(parameters[0]),
            _ => new TypeApplicationNode(parameters[0], parameters.Skip(1).ToList())
        };
    }

    private AstNode parseNestedDefinition()
    {
        _ = Take(TokenKind.LeftParen);
        var body = parseTypeDefinitionBody();
        _ = Take(TokenKind.RightParen);

        return body;
    }
    
    private AstNode parseFunctionApplication(AstNode astNode)
    {
        var parameters = new List<AstNode> {astNode};
        while (Is(TokenKind.Next))
        {
            Take(TokenKind.Next);
            var nextParam = parseTypeDefinitionBody();
            if(Is(TokenKind.LeftParen)) parameters.Add(nextParam);
            else
            {
                if (nextParam is FunctionDefinitionNode fdn)
                    parameters.AddRange(fdn.Parameters);
                else 
                    parameters.Add(nextParam);
            }
        }

        return new FunctionDefinitionNode(parameters);
    }

    private Token? TakeTypeDefinitionIdentifier()
    {
        var id = Take(TokenKind.Word, @"A type should always have an identifier:

type Add = Int -> Int -> Int;
");

        return id != TokenKind.Word ? null : id;
    }
}