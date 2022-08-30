namespace Compiler.Resolvers;

public interface IModule : IDisposable
{
    public string Name { get; }
    public string Text { get; }
    
    public List<AstNode> Nodes { get; internal set; }
}