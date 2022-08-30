using Compiler;
using Compiler.Parsers;
using Compiler.Resolvers;

namespace CLI;

public class FileObserver : IObserver<FileChanged>
{
    private readonly string _basePath;

    public FileObserver(string basePath)
    {
        _basePath = basePath;
    }
    public void OnCompleted()
    {
        Console.WriteLine("Done!");
    }

    public void OnError(Exception error)
    {
        Console.WriteLine(error.Message);
    }

    public void OnNext(FileChanged value)
    {
        
        // remove base path from file path
        var filePath = value.FileName.Substring(_basePath.Length);
        
        // turn file path into namespace and remove extension
        var namespacePath = filePath.Replace('\\', '.').Replace('/', '.').Replace(".car", "");

        var zdragon = new ZDragon(_basePath, new FileResolver(_basePath));
        zdragon.Compile(new FileModule(value.FileName, namespacePath));
        
        
        Console.WriteLine(value.FileName + " changed because of " + value.Reason);
    }
}