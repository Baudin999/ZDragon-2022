using UI.Services;

namespace UI.Requests;

public class DeleteModule
{
    public class DeleteModuleRequest : IHttpRequest
    {
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
        public string FileName { get; set; } = default!;
    }

    public class Handler : IHttpHandler<DeleteModule.DeleteModuleRequest>
    {
        public async Task<IResult> Handle(DeleteModuleRequest deleteModuleRequest, CancellationToken cancellationToken)
        {
            // delete a file
            if (File.Exists(deleteModuleRequest.FileName))
                File.Delete(deleteModuleRequest.FileName);
            else
                return Results.NotFound();
            
            
            // get the namespace form the file name and delete the .out folder and .bin folder entries
            var @namespace = FileHelpers.GetNamespaceFromFileName(deleteModuleRequest.BasePath, deleteModuleRequest.FileName);
            var outPath = Path.Combine(deleteModuleRequest.BasePath, ".out", @namespace);
            if (Directory.Exists(outPath))
                Directory.Delete(outPath, true);
            var binPath = Path.Combine(deleteModuleRequest.BasePath, ".bin");

            var options = new []{
                Path.Combine(binPath,  @namespace + ".nodes.json"),
                Path.Combine(binPath,  @namespace + ".refs.json")
            };
            foreach (var file in Directory.GetFiles(binPath))
            {
                if (options.Contains(file))
                {
                    File.Delete(file);
                } 
            }
            
            // recursively delete empty directories
            recursivelyDeleteEmptyDirectories(deleteModuleRequest.BasePath);

            await Task.Delay(1);

            // return the result of deleting the file            
            return Results.Ok(new
            {
                message = $"Successfully deleted {deleteModuleRequest.FileName}",
                basePath = deleteModuleRequest.BasePath,
                fullName = deleteModuleRequest.FileName,
                files =  new FileSystemService().GetFileSystemObjects(deleteModuleRequest.BasePath)
            });
            
        }

        private static void recursivelyDeleteEmptyDirectories(string directoryPath)
        {
            // delete all empty directories in BasePath
            foreach (var dir in Directory.GetDirectories(directoryPath))
            {
                if (dir.EndsWith(".bin") || dir.EndsWith(".out")) continue;
                if (Directory.GetFiles(dir).Length == 0 && Directory.GetDirectories(dir).Length == 0)
                {
                    Directory.Delete(dir);
                }
                else
                {
                    recursivelyDeleteEmptyDirectories(dir);
                }
            }
        }
    }
}