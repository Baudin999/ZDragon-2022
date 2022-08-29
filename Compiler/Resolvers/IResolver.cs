namespace Compiler.Resolvers;

public interface IResolver
{
    IModule Resolve(string moduleName);
}