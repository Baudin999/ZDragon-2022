namespace Compiler.Parsers.Nodes
{
    public interface IIdentifier
    {
        Token IdToken { get; }
        string Id { get; }

        string Hydrate();
    }
}