namespace Compiler.Parsers.Nodes;

public class ComponentAttribute : IIdentifier
{

    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public Token ValueToken { get; }
    public string Value => ValueToken.Value.Trim();
    public List<Token> ValueTokens { get; }
    public List<ComponentAttributeListItem>? Items = null;
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
                .Select(v =>
                {
                    var parts = v.Split(";");
                    var length = parts.Length;
                    var id = parts[0].Trim();
                    var title = length > 1 ? parts[1] : null;
                    var technology = length > 2 ? parts[2] : null;
                    var direction = length > 3 ? parts[3] : null;
                    var token = valueTokens.FirstOrDefault(v => v.Value == id);
                    return new ComponentAttributeListItem(id, title, technology, direction, token);
                })
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

public class ComponentAttributeListItem
{
    public string Id { get; }
    public string? Title { get; }
    public string? Technology { get; }
    public string? Direction { get; }
    public Token? Token { get; }

    [JsonConstructor]
    public ComponentAttributeListItem(string id, string? title, string? technology, string? direction, Token? token)
    {
        Id = id;
        Title = title;
        Technology = technology;
        Direction = direction;
        Token = token;
    }
}