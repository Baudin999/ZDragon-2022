namespace Compiler.Parsers.Nodes;

public class IdentifierNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    
    public IdentifierNode(Token id)
    {
        IdToken = id;
    }
}

public class TypeApplicationNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public Token[] TypeArgs { get; }
    
    public TypeApplicationNode(Token id, Token[] typeArgs)
    {
        IdToken = id;
        TypeArgs = typeArgs;
    }
}