namespace Compiler.Parsers.Nodes;

public class EnumNode : AstNode
{
    public readonly Token IdToken;
    public string Id => IdToken.Value;
    public List<EnumFieldNode> Fields { get; }
    private List<Token> _annotationTokens;
    public readonly string Description;
    
    [JsonConstructor]
    public EnumNode(Token idToken, List<EnumFieldNode> fields, List<Token> annotationTokens)
    {
        IdToken = idToken;
        _annotationTokens = annotationTokens;
        Fields = fields;
        this.Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }
}


public class EnumFieldNode
{
    public Token ValueToken { get; }
    public string Value => ValueToken.Value;
    public List<Token> AnnotationTokens { get; }
    public readonly string Description;
    
    [JsonConstructor]
    public EnumFieldNode(Token valueToken, List<Token> annotationTokens)
    {
        ValueToken = valueToken;
        AnnotationTokens = annotationTokens;
        Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }

}