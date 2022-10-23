namespace Compiler.Parsers.Nodes;

public class StyleElement
{
    public Token KeyToken { get; }
    public string Key => KeyToken.Value.Trim();
    
    public Token ValueToken { get;  }
    public string Value => ValueToken.Value.Trim();
    
    public StyleElement(Token keyToken, Token valueToken)
    {
        KeyToken = keyToken;
        ValueToken = valueToken;
    }
}