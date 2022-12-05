namespace Compiler.Parsers.Nodes;

public class DataFieldNode
{
    public List<Token> TypeTokens { get; }
    private List<Token> _annotationTokens;
    public readonly string Description;

    public DataFieldNode(List<Token> typeTokens, List<Token> annotationTokens)
    {
        TypeTokens = typeTokens;
        _annotationTokens = annotationTokens;
        Description = Helpers.DescriptionFromAnnotations(annotationTokens);
    }

    public DataFieldNode Clone()
    {
        return new DataFieldNode(
            TypeTokens.Select(t => t.Clone()).ToList(),
            _annotationTokens.Select(t => t.Clone()).ToList()
        );
    }
}