

namespace Compiler.Parsers.Nodes;

public class ComponentAttribute : IIdentifier
{

    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public List<Token>? ValueTokens { get; }
    public List<ComponentAttributeListItem>? Items = null;
    public bool IsList { get; }
    public List<Token> AnnotationTokens { get; }
    public string Description { get; }
    public string Value { get; }

    [JsonConstructor]
    public ComponentAttribute(Token idToken, List<Token>? valueTokens, List<ComponentAttributeListItem>? listItems, List<Token> annotationTokens)
    {
        this.IdToken = idToken;
        this.ValueTokens = valueTokens;
        this.Items = listItems;
        this.IsList = listItems is not null && listItems.Count > 0;
        this.AnnotationTokens = annotationTokens;
        this.Description = Helpers.DescriptionFromAnnotations(annotationTokens);

        if (ValueTokens is not null)
        {
            this.Value = string.Join("", ValueTokens.Select(t => t.Value)).Trim();
        }
        else if (Items is not null)
        {
            this.Value = string.Join(Environment.NewLine, Items.Select(i => this.ToString()));
        }
        else
        {
            this.Value = "INVALID ITEM";
        }
    }

    public ComponentAttribute Clone()
    {
        return new ComponentAttribute(
                IdToken.Clone(),
                ValueTokens?.Select(v => v.Clone()).ToList(),
                Items?.Select(v => v.Clone()).ToList(),
                AnnotationTokens.Select(v => v.Clone()).ToList()
            );
        
    }
}

public class ComponentAttributeListItem
{
    public List<Token> IdTokens { get; }
    public string Id { get; }
    public List<Token>? TitleTokens { get; }
    public string? Title { get; }
    public List<Token>? TechnologyTokens { get; }
    public string? Technology { get; }
    public List<Token>? DirectionTokens { get; }
    public string? Direction { get; }

    public string Value => IdTokens.Last().Value;
    

    [JsonConstructor]
    public ComponentAttributeListItem(List<Token> idTokens, List<Token>? titleTokens, List<Token>? technologyTokens, List<Token>? directionTokens)
    {
        this.IdTokens = idTokens;
        this.Id = string.Join("", idTokens.Select(t => t.Value)).Trim();
        this.TitleTokens = titleTokens;
        if (titleTokens is not null)
            this.Title = string.Join("", titleTokens.Select(t => t.Value)).Trim();
        this.TechnologyTokens = technologyTokens;
        if (technologyTokens is not null)
            this.Technology = string.Join("", technologyTokens.Select(t => t.Value)).Trim();
        this.DirectionTokens = directionTokens;
        if (directionTokens is not null)
            this.Direction = string.Join("", directionTokens.Select(t => t.Value)).Trim();
    }

    public ComponentAttributeListItem Clone()
    {
        return new ComponentAttributeListItem(
            IdTokens.Select(t => t.Clone()).ToList(),
            TitleTokens?.Select(t => t.Clone()).ToList(),
            TechnologyTokens?.Select(t => t.Clone()).ToList(),
            DirectionTokens?.Select(t => t.Clone()).ToList()
        );
    }

    public override string ToString()
    {
        return Id;
    }
}