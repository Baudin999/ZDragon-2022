namespace Compiler.Parsers.Nodes;

public class StyleElement
{
    public Token KeyToken { get; }
    public string Key => KeyToken.Value;
    
    public Token ValueToken { get;  }
    public string Value => ValueToken.Value;
    
    public StyleElement(Token keyToken, Token valueToken)
    {
        KeyToken = keyToken;
        ValueToken = valueToken;
    }
}