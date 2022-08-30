// See https://aka.ms/new-console-template for more information


using CLI;

string basePath = Environment.GetCommandLineArgs()[1];

var fileWatcher = new Compiler.FileWatcher();
fileWatcher.Subscribe(new FileObserver());
fileWatcher.Start(basePath);