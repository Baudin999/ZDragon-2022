namespace Compiler.Parsers;

public class NodeReference {
    public NodeReference(Token from, Token to, ReferenceType type)
    {
        FromToken = from;
        ToToken = to;
        Type = type;
    }

    public Token ToToken { get; }
    public string To => ToToken.Value;
    public Token FromToken { get; }
    public string From => FromToken.Value;
    public ReferenceType Type { get; }
}



public enum ReferenceType
{
    Extends,
    Contains,
    InteractsWith,
    UsedInFunction,
    DefinedIn,
    Aggregate,
    UsedInrecord
}