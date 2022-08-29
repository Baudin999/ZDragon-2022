namespace Compiler.Resolvers;

public class FileModule : IModule
{
    private readonly string _fileName;

    public string Name { get; }
    public string Text { get; }
    
    private List<AstNode> _nodes;
    List<AstNode> IModule.Nodes
    {
        get => _nodes;
        set => _nodes = value;
    }

    public FileModule(string fileName, string name)
    {
        Name = name;
        
        _fileName = fileName;
        Text = loadText();
        _nodes = new List<AstNode>();
    }

    private string loadText()
    {
        // load the text from the file
        try
        {
            var text = File.ReadAllText(_fileName);
            return text;
        }
        catch (Exception e)
        {
            throw new Exception($"Error loading file {_fileName}", e);
        }
    }
}