namespace Compiler.Parsers;

public class NodeReference {
    public NodeReference(Token fromToken, Token toToken, ReferenceType type, Token? versionToken = null)
    {
        FromToken = fromToken;
        ToToken = toToken;
        Type = type;
        VersionToken = versionToken;
    }

    public Token ToToken { get; }
    public string To => ToToken.Value;
    public Token FromToken { get; }
    public string From => FromToken.Value;
    public ReferenceType Type { get; }
    public Token? VersionToken { get; }


    public override string ToString()
    {
        return $"{From} --{Type}-- {To}";
    }
}

public class DataReference : NodeReference
{
    public DataReference(Token fromToken, Token toToken, ReferenceType type) : base(fromToken, toToken, type)
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