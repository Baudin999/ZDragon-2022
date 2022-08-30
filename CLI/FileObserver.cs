using Compiler;

namespace CLI;

public class FileObserver : IObserver<FileChanged>
{
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
        Console.WriteLine(value.FileName + " changed because of " + value.Reason);
    }
}