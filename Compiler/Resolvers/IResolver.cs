namespace Compiler.Resolvers;

public interface IResolver : IDisposable
{
    Task<IModule> Resolve(string moduleName);
}