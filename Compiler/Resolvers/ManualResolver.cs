namespace Compiler.Resolvers;

public class ManualResolver : IResolver
{
    private readonly Dictionary<string, string> _resolutions;

    public ManualResolver(Dictionary<string, string> resolutions)
    {
        this._resolutions = resolutions;
    }


    public IModule Resolve(string moduleName)
    {
        return new TextModule(moduleName, _resolutions[moduleName]);
    }
}