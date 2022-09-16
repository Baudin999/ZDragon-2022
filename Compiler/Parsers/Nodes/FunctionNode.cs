namespace Compiler.Parsers.Nodes;

public class FunctionNode : AstNode
{
    private readonly Token _idToken;
    public List<Token> Parameters { get; }
    public Expression Body { get; }
    public string Id => _idToken.Value;

    public FunctionNode(Token idToken, List<Token> parameters, Expression body)
    {
        if (parameters.Count == 1 && parameters[0] == TokenKind.EmptyParamList)
        {
            parameters = new List<Token>();
        }
        
        _idToken = idToken;
        Parameters = parameters;
        Body = body;
    }
}