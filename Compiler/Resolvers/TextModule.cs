namespace Compiler.Resolvers;

public class TextModule : IModule
{
    public string Text { get; set; }
    public string Name { get; set; }
    
    private List<AstNode> _nodes;
    List<AstNode> IModule.Nodes
    {
        get => _nodes;
        set => _nodes = value;
    }

    
    public TextModule(string name, string text)
    {
        this.Text = text;
        this.Name = name;
        this._nodes = new List<AstNode>();

        var errorSink = new ErrorSink();
        var lexerTokens = new Lexer(text, errorSink).Lex();
        var grouper = new Grouper(lexerTokens, errorSink).Group();
        _nodes = new Parser(grouper, errorSink, new List<NodeReference>()).Parse();
    }


    public void Dispose()
    {
        _nodes = new List<AstNode>();
    }
}