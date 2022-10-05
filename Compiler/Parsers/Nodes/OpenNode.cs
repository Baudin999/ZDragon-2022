namespace Compiler.Parsers.Nodes;

public class OpenNode : AstNode
{
    private readonly List<Token> _openTokens;

    public OpenNode(List<Token> openTokens)
    {
        _openTokens = openTokens;
    }
}