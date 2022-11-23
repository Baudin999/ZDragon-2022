namespace Compiler.Parsers.Nodes;

public class FieldRestriction
{
    public Token ValueToken { get; set; }
    public string Value => ValueToken.Value;

    public Token KeyToken { get; set; }
    public string Key => KeyToken.Value; 
    
    [JsonConstructor]
    public FieldRestriction(Token key, Token value)
    {
        this.KeyToken = key;
        this.ValueToken = value;
    }

}