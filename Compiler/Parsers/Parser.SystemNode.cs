namespace Compiler.Parsers;

public partial class Parser
{
    private SystemNode? parseSystem()
    {
        var result = parseArchitectureNode(TokenKind.KWSystem);
        if (result is null) return null;
        var (id, attributes, extensions, annotations) = result.Value; 
        return new SystemNode(id, attributes, extensions, annotations);
    }

    
}