// See https://aka.ms/new-console-template for more information


using CLI;

// set basePath to first cli argument if present, else default to current directory
string GetBasePath()
{
    var s =
        Environment.GetCommandLineArgs().Length > 1
            ? Environment.GetCommandLineArgs()[1]
            : Directory.GetCurrentDirectory();

    var userProfileFolder = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
    Console.WriteLine(userProfileFolder);

    if (!Environment.OSVersion.ToString().ToLower().Contains("win") && s.StartsWith("~"))
    {
        // remove the tilde, and the first starting /
        // and combine that with the user profile path
        // to get to the actual path on a unix/linux/osx machine
        s = Path.Combine(userProfileFolder, s.Replace("~", "").Substring(1));
    }

    return s;
}

var basePath = GetBasePath();

if (!Directory.Exists(basePath))
{
    Console.WriteLine($"{basePath} does not exist.");
    return;
}
Console.WriteLine("Watching: " + basePath);



using var fileWatcher = new FileWatcher();
using var fileObserver = new FileObserver(basePath);
var unsubscribe = fileWatcher.Subscribe(fileObserver);
fileWatcher.Start(basePath);
unsubscribe.Dispose();
fileWatcher.Stop();
fileWatcher.Dispose();
fileObserver.Dispose();


