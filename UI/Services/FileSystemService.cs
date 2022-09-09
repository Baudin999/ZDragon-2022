namespace UI.Services;

public class FileSystemService
{
    // method which recursively parses a directory and returns all files and directories
    // while keeping hte nesting
    public List<FileSystemObject> GetFileSystemObjects(string basePath)
    {
        basePath = FileHelpers.SystemBasePath(basePath);
        
        var fileSystemObjects = new List<FileSystemObject>();
        var directories = Directory.GetDirectories(basePath);
        var files = Directory.GetFiles(basePath);
        foreach (var directory in directories)
        {
            var name = Path.GetFileName(directory);
            if (name.StartsWith(".")) continue;
            
            var fileSystemObject = new FileSystemObject
            {
                Name = name,
                Type = "directory",
                Path = directory,
                Children = GetFileSystemObjects(directory)
            };
            fileSystemObjects.Add(fileSystemObject);
        }
        foreach (var file in files)
        {
            var fileSystemObject = new FileSystemObject
            {
                Name = Path.GetFileName(file),
                Type = "file",
                Path = file,
                Namespace = FileHelpers.GenerateNamespaceFromFileName(basePath, file)
            };
            fileSystemObjects.Add(fileSystemObject);
        }
        return fileSystemObjects;
    }

  


    public class FileSystemObject
    {
        public string Name { get; set; } = default!;
        public string Type { get; set; } = default!;
        public string Path { get; set; } = default!;
        public string Namespace { get; set; } = default!;
        public List<FileSystemObject> Children { get; set; } = default!;    
    }

}