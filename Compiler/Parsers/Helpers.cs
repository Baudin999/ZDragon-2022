namespace Compiler.Parsers;

public static class Helpers
{
    public static string DescriptionFromAnnotations(List<Token> annotationTokens)
    {
        return string.Join(Environment.NewLine, annotationTokens.Select(t => t.Value.Replace("@", "").Trim()));
    }

    public static List<string> BaseTypes = new List<string>()
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
        "Char"
    };
}