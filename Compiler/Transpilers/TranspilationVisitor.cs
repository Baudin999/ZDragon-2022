
namespace Compiler.Transpilers;

public abstract class TranspilationVisitor
{
    private StringBuilder _stringBuilder = new();
    private List<AstNode> _nodes = new();

    protected void Visit(AstNode node)
    {
        if (node is ComponentNode componentNode) visitComponentNode(componentNode);
        else if (node is SystemNode systemNode) visitSystemNode(systemNode);
        else if (node is EndpointNode endpointNode) visitEndpointNode(endpointNode);
        else if (node is RecordNode recordNode) visitRecordNode(recordNode);
        else if (node is DataNode dataNode) visitDataNode(dataNode);
        else if (node is EnumNode enumNode) visitEnumNode(enumNode);
        else if (node is MarkdownChapterNode chapterNode) visitChapterNode(chapterNode);
        else if (node is MarkdownParagraphNode paragraphNode) visitParagraphNode(paragraphNode);
        else if (node is ViewNode viewNode) visitViewNode(viewNode);
    }

    protected void Visit(string id)
    {
        var result = (AstNode?)_nodes.OfType<IIdentifier>().FirstOrDefault(n => n.Id == id);
        if (result is null) return;
        else Visit(result);
    }
    
    protected void Visit(ComponentAttributeListItem componentAttributeListItem)
    {
        var id = componentAttributeListItem.Id;
        var result = (AstNode?)_nodes.OfType<IIdentifier>().FirstOrDefault(n => n.Id == id);
        if (result is null) return;
        else Visit(result);
    }

    // architecture nodes
    protected abstract void visitComponentNode(ComponentNode componentNode);
    protected abstract void visitSystemNode(SystemNode systemNode);
    protected abstract void visitEndpointNode(EndpointNode endpointNode);
    
    // type system nodes
    protected abstract void visitRecordNode(RecordNode recordNode);
    protected abstract void visitDataNode(DataNode dataNode);
    protected abstract void visitEnumNode(EnumNode enumNode);
    
    // document nodes
    protected abstract void visitChapterNode(MarkdownChapterNode chapterNode);
    protected abstract void visitParagraphNode(MarkdownParagraphNode paragraphNode);
    protected abstract void visitViewNode(ViewNode viewNode);

    protected virtual List<AstNode> PrepNodes(List<AstNode> astNodes)
    {
        return astNodes;
    }
    
    protected abstract void Start();
    protected abstract void Stop();

    protected void Append(string s)
    {
        // escape the newline characters in the string
        //s = s.Replace("\r", "\\r").Replace("\n", "\\n");
        
        _stringBuilder.Append(s);
        _stringBuilder.Append(Environment.NewLine);
    }
    

    public string Run(List<AstNode> nodes)
    {
        var __nodes = PrepNodes(nodes);
        this._nodes = __nodes;
        Start();
        foreach (var node in _nodes)
        {
            Visit(node);
        }

        Stop();

        return _stringBuilder.ToString();
    }

    internal bool Has(string id)
    {
        return _nodes.OfType<IIdentifier>().FirstOrDefault(n => n.Id == id) is not null;
    }
    
    internal AstNode? Get(string id)
    {
        return (AstNode)_nodes.OfType<IIdentifier>().FirstOrDefault(n => n.Id == id)!;
    }
}