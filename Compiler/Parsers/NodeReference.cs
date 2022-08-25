namespace Compiler.Parsers;

public class NodeReference {
    public NodeReference(string from, string to, ReferenceType type)
    {
        From = from;
        To = to;
        Type = type;
    }

    public string To { get; }

    public string From { get; }
    public ReferenceType Type { get; }
}



public enum ReferenceType
{
    Extends,
    Contains,
    InteractsWith
}