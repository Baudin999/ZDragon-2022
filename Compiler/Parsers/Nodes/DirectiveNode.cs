namespace Compiler.Parsers.Nodes;

public class DirectiveNode: AstNode
{
    public string Key { get; }
    public string Value { get; }
    
    [JsonConstructor]
    public DirectiveNode(string key, string value)
    {
        Key = key;
        Value = value;
    }

    public DirectiveNode(Token originalToken)
    {
        string source = originalToken.Value;
        if (source.StartsWith("%"))
            source = source[1..];
        
        var parts = source.Split(':');
        Key = parts[0].Trim();
        Value = parts[1].Trim();
    }
}