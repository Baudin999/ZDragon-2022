namespace Compiler.Parsers.Nodes;

public class TypeDefinitionNode : AstNode, IAttributesNode, IDataNode
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public AstNode Body { get; }
    
    public string Description { get; }

    [JsonConstructor]
    public TypeDefinitionNode(Token idToken, AstNode body)
    {
        IdToken = idToken;
        Body = body;
        this.Description = "";
    }

    public override TypeDefinitionNode Clone()
    {
        return new TypeDefinitionNode(
            IdToken.Clone(), 
            Body.Clone()
        );
    }
    
    public string Hydrate()
    {
        return "Hydration not implemented";
    }
}


