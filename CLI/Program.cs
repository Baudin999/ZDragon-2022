// See https://aka.ms/new-console-template for more information


using CLI;

// set basePath to first cli argument if present, else default to current directory
string basePath = 
    Environment.GetCommandLineArgs().Length > 1 ? 
        Environment.GetCommandLineArgs()[1] : 
        Directory.GetCurrentDirectory();

var fileWatcher = new FileWatcher();
fileWatcher.Subscribe(new FileObserver(basePath));
fileWatcher.Start(basePath);