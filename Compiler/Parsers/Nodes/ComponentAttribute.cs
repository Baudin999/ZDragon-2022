namespace Compiler.Parsers.Nodes;

public class ComponentAttribute
{

    public Token IdToken { get; }
    public string Id => IdToken.Value;
    public Token ValueToken { get; }
    public string Value => ValueToken.Value.Trim();
    public List<Token> ValueTokens { get; }
    public List<string>? Items = null;
    public bool IsList => Items is not null;
    public string Description { get; } 

    public ComponentAttribute(Token id, Token value, List<Token> valueTokens, List<Token> annotations)
    {
        this.IdToken = id;
        this.ValueToken = value;
        this.ValueTokens = valueTokens;

        if (this.Value.StartsWith("-"))
        {
            // we have a list attribute
            Items = value
                .Value
                .Trim()
                .Split("-")
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList();
        }

        this.Description = Helpers.DescriptionFromAnnotations(annotations);
    }
}