namespace Compiler.Resolvers;

public class FileResolver : IResolver
{
    public string BasePath { get; }
    
    public FileResolver(string basePath)
    {
        BasePath = basePath;
    }


    public IModule Resolve(string @namespace)
    {
        // convert namespace to filename
        var filename = @namespace.Replace('.', '/') + ".car";
        
        
        // prefix with base path
        var path = BasePath + filename;
        
        return new  FileModule(path, @namespace);
    }
}