using Compiler;
using Compiler.Resolvers;

namespace CLI;

public class FileObserver : IObserver<FileChanged>, IDisposable
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
        run(value);
    }

    async void run(FileChanged value)
    {
        // remove base path from file path
        var filePath = value.FileName.Substring(_basePath.Length);
        
        // turn file path into namespace and remove extension
        var namespacePath = filePath.Replace('\\', '.').Replace('/', '.').Replace(".car", "");
        if (namespacePath.StartsWith("."))
            namespacePath = namespacePath.Substring(1);

        // compile the code
        using var zdragon = new ZDragon(_basePath, new FileResolver(_basePath));
        using var module = new FileModule(_basePath, value.FileName, namespacePath);
        await module.LoadText();
        await zdragon.Compile(module);
        
        
        // console log the changes and errors
        Console.WriteLine(value.FileName + " changed because of " + value.Reason);
        Console.WriteLine("Compiled " + namespacePath + $" with {zdragon.Errors.Count} errors");
        if (zdragon.Errors.Count > 0)
        {
            foreach (var error in zdragon.Errors)
            {
                Console.WriteLine(error);
            }    
        }
        
        // write to file
        var outPath = Path.Combine(_basePath, ".bin", namespacePath + ".json");
        await FileHelpers.SaveObjectAsync(outPath, zdragon.Nodes.Concat(zdragon.Imports));
    }

    public void Dispose()
    {
    }
}