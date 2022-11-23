namespace Compiler.Parsers.Nodes;

public class RecordNode : AttributesNode<RecordFieldNode>
{
    public RecordNode(Token idToken, List<RecordFieldNode> fields, List<Token> annotationTokens) :
        base(idToken, fields, new List<Token>(), annotationTokens)
    {
    }
}


public class RecordFieldNode : IIdentifier
{
    private readonly Token _idToken;
    public string Id => _idToken.Value;
    public List<Token> TypeTokens { get; }
    public List<FieldRestriction> FieldRestrictions { get; }
    public string Type => string.Join(" ", TypeTokens.Select(t => t.Value)).Trim();
    private List<Token> _annotationTokens;
    public readonly string Description;
    
    [JsonConstructor]
    public RecordFieldNode(Token idToken, List<Token> typeTokens, List<Token> annotationTokens,
        List<FieldRestriction> fieldRestrictions)
    {
        this._idToken = idToken;
        this.TypeTokens = typeTokens;
        FieldRestrictions = fieldRestrictions;
        this._annotationTokens = annotationTokens;
        this.Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }

}