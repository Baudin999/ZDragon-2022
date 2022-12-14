namespace Compiler.Parsers.Nodes;

public class FunctionNode : AstNode, IIdentifier
{
    public Token IdToken { get; }
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

    public override FunctionNode Clone()
    {
        return new FunctionNode(
            IdToken.Clone(),
            Parameters.Select(p => p.Clone()).ToList(),
            (Expression)Body.Clone()
        );
    }
    
    public string Hydrate()
    {
        return "Hydration not implemented";
    }
}