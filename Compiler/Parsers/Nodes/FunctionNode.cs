namespace Compiler.Parsers.Nodes;

public class FunctionNode : AstNode
{
    private readonly Token _idToken;
    public List<Token> Parameters { get; }
    public AstNode Body { get; }
    public string Id => _idToken.Value;

    public FunctionNode(Token idToken, List<Token> parameters, AstNode body)
    {
        _idToken = idToken;
        Parameters = parameters;
        Body = body;
    }
}