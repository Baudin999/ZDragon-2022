namespace Compiler.Parsers.Nodes;

public class TypeApplicationNode : AstNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public List<Token> TypeArgs { get; }
    
    public TypeApplicationNode(Token idToken, List<Token> typeArgs)
    {
        IdToken = idToken;
        TypeArgs = typeArgs;
    }

    public override TypeApplicationNode Clone()
    {
        return new TypeApplicationNode(
            IdToken.Clone(),
            TypeArgs.Select(t => t.Clone()).ToList()
        );
    }
}