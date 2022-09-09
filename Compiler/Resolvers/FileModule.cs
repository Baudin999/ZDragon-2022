using Newtonsoft.Json;
using System.Threading.Tasks;

namespace Compiler.Resolvers;

public class FileModule : IModule
{
    private readonly string _filePath;
    private readonly string _basePath;

    public string Namespace { get; }
    public string Text { get; private set; }
    
    private List<AstNode> _nodes;
    List<AstNode> IModule.Nodes
    {
        get => _nodes;
        set => _nodes = value;
    }

    public FileModule(string basePath, string filePath, string? text = null)
    {
        Namespace = FileHelpers.GenerateNamespaceFromFileName(basePath, filePath);
        Text = text ?? "";
        _filePath = Path.Combine(basePath, filePath);
        _nodes = new List<AstNode>();
        _basePath = basePath;
    }

    public async Task LoadText()
    {
        Text = await FileHelpers.ReadFileAsync(_filePath) ?? "";
    }

    public async Task SaveText()
    {
        await FileHelpers.SaveFileAsync(_filePath, Text);
    }
    
    public async Task<FileModule> Init()
    {
        // load the pre-compiled AST from teh file system.
        
        var jsonPath = Path.Combine(
            _basePath,
            ".bin",
            $"{Namespace}.json"
        );
        if (File.Exists(jsonPath))
        {
            var path = Path.GetFullPath(jsonPath);
            var nodes = await FileHelpers.ReadObjectAsync<List<AstNode>>(path);
            _nodes = nodes ?? new List<AstNode>();
        }

        return this;
    }
    
    public void Dispose()
    {
        this._nodes = new List<AstNode>();
    }
}