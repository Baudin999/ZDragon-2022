namespace Compiler.Parsers.Nodes;

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

    public override TypeApplicationNode Clone()
    {
        return new TypeApplicationNode(
            IdToken.Clone(),
            TypeArgs.Select(t => t.Clone()).ToArray()
        );
    }
}