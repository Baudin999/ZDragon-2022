namespace Compiler.Parsers.Nodes;

public class DataNode: AstNode, IIdentifier
{
    public readonly Token IdToken;
    public string Id => IdToken.Value;
    public List<DataFieldNode> Fields { get; }
    private List<Token> _annotationTokens;
    public readonly string Description;
    
    public DataNode(Token idToken, List<DataFieldNode> fields, List<Token> annotationTokens)
    {
        IdToken = idToken;
        _annotationTokens = annotationTokens;
        Fields = fields;
        this.Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }

    public override AstNode Clone()
    {
        return new DataNode(
            IdToken.Clone(), 
            Fields.Select(f => (DataFieldNode)f.Clone()).ToList(), 
            _annotationTokens.Select(a => a.Clone()).ToList()
        );
    }
}