namespace Compiler.Resolvers;

public class ManualResolver : IResolver
{
    private readonly Dictionary<string, string> _resolutions;

    public ManualResolver(Dictionary<string, string> resolutions)
    {
        this._resolutions = resolutions;
    }


    public async Task<IModule> Resolve(string moduleName)
    {
        return await Task.FromResult(new TextModule(moduleName, _resolutions[moduleName]));
    }

    public void Dispose()
    {
        _resolutions.Clear();
    }
}