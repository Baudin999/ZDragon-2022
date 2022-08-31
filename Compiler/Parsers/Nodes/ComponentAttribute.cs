namespace Compiler.Parsers.Nodes;

public class ComponentAttribute : IIdentifier
{

    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public Token ValueToken { get; }
    public string Value => ValueToken.Value.Trim();
    public List<Token> ValueTokens { get; }
    public List<string>? Items = null;
    public bool IsList => Items is not null;
    public List<Token> AnnotationTokens { get; }
    public string Description { get; } 

    [JsonConstructor]
    public ComponentAttribute(Token idToken, Token valueToken, List<Token> valueTokens, List<Token> annotationTokens)
    {
        this.IdToken = idToken;
        this.ValueToken = valueToken;
        this.ValueTokens = valueTokens;
        this.AnnotationTokens = annotationTokens;

        if (this.Value.StartsWith("-"))
        {
            // we have a list attribute
            Items = valueToken
                .Value
                .Trim()
                .Split("-")
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList();
        }

        this.Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }

    public ComponentAttribute Clone()
    {
        return new ComponentAttribute(
                IdToken.Clone(),
                ValueToken.Clone(),
                ValueTokens.Select(v => v.Clone()).ToList(),
                AnnotationTokens.Select(v => v.Clone()).ToList()
            );
        
    }
}