namespace Compiler.Parsers;

public static class Helpers
{
    public static string DescriptionFromAnnotations(List<Token> annotationTokens)
    {
        return string.Join(Environment.NewLine, annotationTokens.Select(t => t.Value.Replace("@", "").Trim()));
    }
}