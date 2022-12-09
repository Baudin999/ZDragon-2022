namespace Compiler.Parsers;

public static class Helpers
{
    public static string DescriptionFromAnnotations(List<Token> annotationTokens)
    {
        if (annotationTokens is null)
            annotationTokens = new List<Token>();
        
        return string.Join(Environment.NewLine, annotationTokens.Select(t => t.Value.Replace("@", "").Trim()));
    }

    public static readonly List<string> BaseTypes = new ()
    {
        "Maybe",
        "List",
        "Int",
        "Decimal",
        "Number",
        "Money",
        "Date",
        "Time",
        "DateTime",
        "Guid",
        "Uuid",
        "String",
        "Boolean",
        "Char",
        "int",
        "decimal",
        "guid",
        "uuid",
        "string",
        "bool",
        "char"
    };
}