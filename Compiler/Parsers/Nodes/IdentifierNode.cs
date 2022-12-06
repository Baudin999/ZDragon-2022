namespace Compiler.Parsers.Nodes;

public class IdentifierNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    [JsonConstructor]
    public IdentifierNode(Token idToken)
    {
        IdToken = idToken;
    }

    public override IdentifierNode Clone()
    {
        return new IdentifierNode(IdToken.Clone());
    }
}