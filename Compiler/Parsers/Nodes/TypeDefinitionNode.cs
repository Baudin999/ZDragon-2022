namespace Compiler.Parsers.Nodes;

public class TypeDefinitionNode : AstNode, IAttributesNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public AstNode Body { get; }
    
    public string Description { get; }

    public TypeDefinitionNode(Token idToken, AstNode body)
    {
        IdToken = idToken;
        Body = body;
        this.Description = "";
    }
}


