namespace Compiler.Parsers.Nodes;

public class IdentifierNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    public IdentifierNode(Token id)
    {
        IdToken = id;
    }

    public override IdentifierNode Clone()
    {
        return new IdentifierNode(IdToken.Clone());
    }
}