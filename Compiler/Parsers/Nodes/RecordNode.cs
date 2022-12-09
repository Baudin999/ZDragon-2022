namespace Compiler.Parsers.Nodes;

public class RecordNode : AttributesNode<RecordFieldNode>, IDataNode
{
    public RecordNode(Token idToken, List<RecordFieldNode> attributes, List<Token> extensionTokens, List<Token> annotationTokens) :
        base(idToken, attributes, extensionTokens, annotationTokens)
    {
    }

    public override RecordNode Clone()
    {
        return new RecordNode(
            IdToken, 
            Attributes.Select(f => f.Clone()).ToList(), 
            ExtensionTokens.Select(t => t.Clone()).ToList(), 
            AnnotationTokens.Select(a => a.Clone()).ToList()
        );
    }
}

public class RecordFieldNode : IIdentifier
{
    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public List<Token> TypeTokens { get; }
    public List<FieldRestriction> FieldRestrictions { get; }
    public string Type => string.Join(" ", TypeTokens.Select(t => t.Value)).Trim();
    public readonly List<Token> AnnotationTokens;
    public readonly string Description;
    
    [JsonConstructor]
    public RecordFieldNode(Token idToken, List<Token> typeTokens, List<Token> annotationTokens,
        List<FieldRestriction> fieldRestrictions)
    {
        this.IdToken = idToken;
        this.TypeTokens = typeTokens;
        FieldRestrictions = fieldRestrictions;
        this.AnnotationTokens = annotationTokens;
        this.Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }

    public RecordFieldNode Clone()
    {
        return new RecordFieldNode(
            IdToken.Clone(),
            TypeTokens.Select(t => t.Clone()).ToList(),
            AnnotationTokens.Select(a => a.Clone()).ToList(),
            FieldRestrictions.Select(r => r.Clone()).ToList()
        );
    }
    
    public string Hydrate()
    {
        return "Hydration not implemented";
    }

}