namespace Compiler.Parsers.Nodes;

public class FunctionNode : AstNode, IIdentifier
{
    public readonly Token IdToken;
    public List<Token> Parameters { get; }
    public Expression Body { get; }
    public string Id => IdToken.Value;

    public FunctionNode(Token idToken, List<Token> parameters, Expression body)
    {
        if (parameters.Count == 1 && parameters[0] == TokenKind.EmptyParamList)
        {
            parameters = new List<Token>();
        }
        
        IdToken = idToken;
        Parameters = parameters;
        Body = body;
    }

    public override AstNode Clone()
    {
        return new FunctionNode(
            IdToken.Clone(),
            Parameters.Select(p => p.Clone()).ToList(),
            (Expression)Body.Clone()
        );
    }
}