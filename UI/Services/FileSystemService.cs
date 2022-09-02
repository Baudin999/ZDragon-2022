namespace UI.Services;

public class FileSystemService
{
    // method which recursively parses a directory and returns all files and directories
    // while keeping hte nesting
    public List<FileSystemObject> GetFileSystemObjects(string path)
    {
        var fileSystemObjects = new List<FileSystemObject>();
        var directories = Directory.GetDirectories(path);
        var files = Directory.GetFiles(path);
        foreach (var directory in directories)
        {
            var fileSystemObject = new FileSystemObject
            {
                Name = Path.GetFileName(directory),
                Type = "directory",
                Children = GetFileSystemObjects(directory)
            };
            fileSystemObjects.Add(fileSystemObject);
        }
        foreach (var file in files)
        {
            var fileSystemObject = new FileSystemObject
            {
                Name = Path.GetFileName(file),
                Type = "file"
            };
            fileSystemObjects.Add(fileSystemObject);
        }
        return fileSystemObjects;
    }
    
    

    public class FileSystemObject
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public List<FileSystemObject> Children { get; set; }    
    }

}