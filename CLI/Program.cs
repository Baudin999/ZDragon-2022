// See https://aka.ms/new-console-template for more information


using CLI;

// set basePath to first cli argument if present, else default to current directory
string basePath = 
    Environment.GetCommandLineArgs().Length > 1 ? 
        Environment.GetCommandLineArgs()[1] : 
        Directory.GetCurrentDirectory();

using var fileWatcher = new FileWatcher();
using var fileObserver = new FileObserver(basePath);
var unsubscribe = fileWatcher.Subscribe(fileObserver);
fileWatcher.Start(basePath);
unsubscribe.Dispose();
fileWatcher.Stop();
fileWatcher.Dispose();
fileObserver.Dispose();