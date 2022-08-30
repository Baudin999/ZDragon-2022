namespace Compiler;


public struct FileChanged
{
    public readonly string FileName;
    public readonly FileChangeReason Reason;

    public FileChanged(string fileName, FileChangeReason fileChangeReason)
    {
        FileName = fileName;
        Reason = fileChangeReason;
    }

}
public class FileWatcher : IObservable<FileChanged>, IDisposable
{
    private readonly List<IObserver<FileChanged>> _observers;
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

    private static List<string> locks = new List<string>();

    private void broadcast(string fileName, FileChangeReason reason)
    {
        if (!locks.Contains(fileName))
        {
            foreach (var subscription in _observers)
            {
                locks.Add(fileName);
                subscription
                    .OnNext(new FileChanged(fileName, reason));
                Task.Delay(300).ContinueWith((t) =>
                {
                    locks.Remove(fileName);
                });
            }
        }
    }

    private void OnChanged(object sender, FileSystemEventArgs e)
    {
        if (e.ChangeType != WatcherChangeTypes.Changed)
        {
            return;
        }
        broadcast(e.FullPath, FileChangeReason.Changed);
    }

    private void OnCreated(object sender, FileSystemEventArgs e)
    {
        broadcast(e.FullPath, FileChangeReason.Created);
    }

    private void OnDeleted(object sender, FileSystemEventArgs e) =>
        broadcast(e.FullPath, FileChangeReason.Deleted);

    private void OnRenamed(object sender, RenamedEventArgs e)
    {
        broadcast(e.FullPath, FileChangeReason.Renamed);
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

public enum FileChangeReason
{
    Changed,
    Created,
    Deleted,
    Renamed
}