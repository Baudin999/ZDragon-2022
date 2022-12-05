namespace Compiler.Parsers;

public class NodeReference {
    
    [JsonConstructor]
    public NodeReference(Token fromToken, Token toToken, ReferenceType referenceType, string @namespace, Token? versionToken = null)
    {
        FromToken = fromToken;
        ToToken = toToken;
        ReferenceType = referenceType;
        VersionToken = versionToken;
        Namespace = @namespace;
        Type = referenceType.ToString();
        
    }

    public Token ToToken { get; }
    public string To => ToToken.Value;
    public Token FromToken { get; }
    public string From => FromToken.Value;
    public ReferenceType ReferenceType { get; }
    public string Namespace { get; }
    public Token? VersionToken { get; }
    
    public string Type { get; } 
    public string Version => VersionToken?.Value ?? string.Empty;
    public string ToType => ToToken.Kind.ToString();
    public string FromType => FromToken.Kind.ToString();

    public override string ToString()
    {
        return $"{From} --{ReferenceType}-- {To}";
    }
}

public class DataReference : NodeReference
{
    public DataReference(Token fromToken, Token toToken, ReferenceType referenceType, string @namespace) : base(fromToken, toToken, referenceType, @namespace)
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