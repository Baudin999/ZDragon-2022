using System.Text;
using Compiler.Parsers.Nodes;

namespace Compiler.Transpilers;

public class DataTranspiler : TranspilationVisitor
{

    protected override void visitComponentNode(ComponentNode componentNode) { }
    protected override void visitSystemNode(SystemNode systemNode) {}
    protected override void visitEndpointNode(EndpointNode endpointNode) { }
    protected override void visitChapterNode(MarkdownChapterNode chapterNode){}
    protected override void visitParagraphNode(MarkdownParagraphNode paragraphNode){}
    protected override void visitViewNode(ViewNode viewNode){}

    protected override void visitRecordNode(RecordNode recordNode)
    {
        var fields = recordNode.Attributes.Select(a => $"    {a.Id}: {a.Type}\n");
        var fieldsString = string.Join("", fields);
        var relations = recordNode
            .Attributes
            .SelectMany(a => a.TypeTokens)
            .Select(a => a)
            .Where(a => !Helpers.BaseTypes.Contains(a.Value) && Has(a.Value))
            .Select(n => $"{recordNode.Id} --> {n.Value}");
        var relationsString = string.Join(Environment.NewLine, relations);
        var extensions = recordNode.Extensions.Select(e => $"{recordNode.Id} --|> {e}");
        var extensionsString = string.Join(Environment.NewLine, extensions);
        
        var description = string.IsNullOrEmpty(recordNode.Description) ? "" : $@"
-- description --
{recordNode.Description}
";
        
        this.Append($@"
entity {recordNode.Id} << (R, lightgreen) >> {{
{fieldsString.Trim()} 
{description.Trim()}
}}
{relationsString}
{extensionsString}
");
    }

    protected override void visitDataNode(DataNode dataNode)
    {
        var fields = dataNode.Fields.Select(a => $"    {a.TypeTokens[0].Value}");
        var fieldsString = string.Join(Environment.NewLine, fields);
        var relations = dataNode.Fields
            .Where(f => Has(f.TypeTokens[0].Value))
            .Select(n => $"{dataNode.Id} --> {n.TypeTokens[0].Value}");
        var relationsString = string.Join(Environment.NewLine, relations);
        var description = string.IsNullOrEmpty(dataNode.Description) ? "" : $@"
-- description --
{dataNode.Description}
";
        
        this.Append($@"
struct {dataNode.Id} << (D, orchid) >> {{
{fieldsString.Trim()} 
{description.Trim()}
}}
{relationsString}
");
    }

    protected override void visitEnumNode(EnumNode enumNode)
    {
        var fields = enumNode.Fields.Select(a => $"    {a.Value}");
        var fieldsString = string.Join(Environment.NewLine, fields);
        var description = string.IsNullOrEmpty(enumNode.Description) ? "" : $@"
-- description --
{enumNode.Description}
";
        this.Append($@"
enum {enumNode.Id} {{
{fieldsString.Trim()}
{description.Trim()}
}}
");
    }

    protected override void Start()
    {
       
    }

    protected override void Stop()
    {
        
    }
    
    
}