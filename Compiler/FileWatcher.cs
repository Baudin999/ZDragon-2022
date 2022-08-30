namespace Compiler;


public struct FileChanged
{
    public readonly string FileName;

    public FileChanged(string fileName)
    {
        FileName = fileName;
    }
}
public class FileWatcher : IObservable<FileChanged>, IDisposable
{
    private List<IObserver<FileChanged>> _observers;
    private FileSystemWatcher? _watcher = null;

    public FileWatcher()
    {
        _observers = new List<IObserver<FileChanged>>();
    }

    public void Start(string basePath)
    {
        using var watcher = new FileSystemWatcher(basePath);

        watcher.NotifyFilter = NotifyFilters.Attributes
                             | NotifyFilters.CreationTime
                             | NotifyFilters.DirectoryName
                             | NotifyFilters.FileName
                             | NotifyFilters.LastAccess
                             | NotifyFilters.LastWrite
                             | NotifyFilters.Security
                             | NotifyFilters.Size;

        watcher.Changed += OnChanged;
        watcher.Created += OnCreated;
        watcher.Deleted += OnDeleted;
        watcher.Renamed += OnRenamed;
        watcher.Error += OnError;

        watcher.Filter = "*.car";
        watcher.IncludeSubdirectories = true;
        watcher.EnableRaisingEvents = true;

        _watcher = watcher;

        Console.WriteLine("Press enter to exit.");
        Console.ReadLine();
    }
    
    public void Stop()
    {
        foreach (var observer in _observers.ToArray())
            if (_observers.Contains(observer))
                observer.OnCompleted();

        _observers.Clear();
    }

    private void OnChanged(object sender, FileSystemEventArgs e)
    {
        if (e.ChangeType != WatcherChangeTypes.Changed)
        {
            return;
        }
        Console.WriteLine($"Changed: {e.FullPath}");
    }

    private void OnCreated(object sender, FileSystemEventArgs e)
    {
        string value = $"Created: {e.FullPath}";
        Console.WriteLine(value);
    }

    private void OnDeleted(object sender, FileSystemEventArgs e) =>
        Console.WriteLine($"Deleted: {e.FullPath}");

    private void OnRenamed(object sender, RenamedEventArgs e)
    {
        Console.WriteLine($"Renamed:");
        Console.WriteLine($"    Old: {e.OldFullPath}");
        Console.WriteLine($"    New: {e.FullPath}");
    }

    private void OnError(object sender, ErrorEventArgs e) =>
        PrintException(e.GetException());

    private void PrintException(Exception? ex)
    {
        if (ex != null)
        {
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine("Stacktrace:");
            Console.WriteLine(ex.StackTrace);
            Console.WriteLine();
            PrintException(ex.InnerException);
        }
    }

    public IDisposable Subscribe(IObserver<FileChanged> observer)
    {
        if (!_observers.Contains(observer))
            _observers.Add(observer);
        return new Unsubscriber(_observers, observer);
    }
    
    private class Unsubscriber : IDisposable
    {
        private List<IObserver<FileChanged>>_observers;
        private IObserver<FileChanged>? _observer;

        public Unsubscriber(List<IObserver<FileChanged>> observers, IObserver<FileChanged>? observer)
        {
            this._observers = observers;
            this._observer = observer;
        }

        public void Dispose()
        {
            if (_observer != null && _observers.Contains(_observer))
                _observers.Remove(_observer);
        }
    }

    public void Dispose()
    {
        Stop();
        if (_watcher is not null)
        {
            _watcher.Dispose();
        }
    }
}