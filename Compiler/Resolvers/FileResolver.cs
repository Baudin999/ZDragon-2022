namespace Compiler.Resolvers;

public class FileResolver : IResolver
{
    public string BasePath { get; }
    
    public FileResolver(string basePath)
    {
        BasePath = basePath;
    }


    public async Task<IModule> Resolve(string @namespace)
    {
        // convert namespace to filename
        var filename = @namespace.Replace('.', '/') + ".car";
        
        // prefix with base path
        var path = Path.Combine(BasePath, filename);
        
        // return the module
        var module = await new FileModule(BasePath, path, @namespace).Init();
        return module;
    }
    
    public void Dispose()
    {
        // do nothing
    }
}