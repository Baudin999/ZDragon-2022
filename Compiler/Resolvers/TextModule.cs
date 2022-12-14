namespace Compiler.Resolvers;

public class TextModule : IModule
{
    public string Text { get; set; }
    public string Namespace { get; set; }
    
    private List<AstNode> _nodes;
    List<AstNode> IModule.Nodes
    {
        get => _nodes;
        set => _nodes = value;
    }

    
    public TextModule(string @namespace, string text)
    {
        this.Text = text;
        this.Namespace = @namespace;
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