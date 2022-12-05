namespace Compiler.Parsers;

public class NodeReference {
    
    [JsonConstructor]
    public NodeReference(Token fromToken, Token? toToken, ReferenceType referenceType, string fromNodeType, string @namespace, Token? versionToken = null)
    {
        FromToken = fromToken;
        ToToken = toToken;
        ReferenceType = referenceType;
        VersionToken = versionToken;
        Namespace = @namespace;
        Type = referenceType.ToString();
        FromNodeType = fromNodeType;
    }

    public Token? ToToken { get; }
    public string To => ToToken?.Value ?? "";
    public Token FromToken { get; }
    public string From => FromToken.Value;
    public ReferenceType ReferenceType { get; }
    public string Namespace { get; }
    public string FromNodeType { get; }
    public string ToNodeType { get; set; } = "";
    public Token? VersionToken { get; }
    
    public string Type { get; } 
    public string Version => VersionToken?.Value ?? string.Empty;

    public override string ToString()
    {
        return $"{From} --{ReferenceType}-- {To}";
    }
}

public class DataReference : NodeReference
{
    public DataReference(Token fromToken, Token toToken, ReferenceType referenceType, string fromNodeType, string @namespace) : 
        base(fromToken, toToken, referenceType, fromNodeType, @namespace)
    {
        // nothing to see
    }
}



public enum ReferenceType
{
    ExtendedBy,
    Contains,
    InteractsWith,
    UsedInFunction,
    DefinedIn,
    Aggregate,
    UsedInRecord,
    ViewedIn,
    TypeAlias,
    UsedInData
}