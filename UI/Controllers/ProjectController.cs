using UI.Services;

namespace UI.Controllers;


[ApiController]
public class ProjectController : ControllerBase
{
    private readonly SessionParameters _sessionParameters;

    public ProjectController(SessionParameters sessionParameters)
    {
        _sessionParameters = sessionParameters;
    }
    
    [HttpGet("/projects")]
    public List<string> GetProjects()
    {
        return new List<string> { "Foo", "Bar" };
    }

    [HttpGet("/project")]
    public ProjectSelector GetCurrentProjectPath()
    {
        return new ProjectSelector
        {
            Path = _sessionParameters.ProjectDirectory
        };
    }

    // [HttpPut("/project")]
    // public List<FileSystemService.FileSystemObject> SetThePathOfTheActiveProject([FromBody]ProjectSelector projectSelector)
    // {
    //     if (!string.IsNullOrEmpty(projectSelector.Path))
    //     {
    //         _sessionParameters.ProjectDirectory = projectSelector.Path;
    //         return new FileSystemService().GetFileSystemObjects(projectSelector.Path);
    //     }
    //
    //     return new List<FileSystemService.FileSystemObject>();
    //
    // }
    
    [HttpPut("/page")]
    public string GetCurrentPagePath(ProjectSelector path)
    {
        // return content of the file if it exists
        if (System.IO.File.Exists(path.Path))
        {
            return System.IO.File.ReadAllText(path.Path);
        }

        return "";
    }
}

public class ProjectSelector
{
    public string? Path { get; set; }
}