using System.Text;
using Compiler.Parsers.Nodes;

namespace Compiler.Transpilers;

public class ArchitectureTranspiler : TranspilationVisitor
{
    private List<string> _renderedIds = new List<string>();
    
    protected override void visitComponentNode(ComponentNode componentNode)
    {
        if (_renderedIds.Contains(componentNode.Id)) return;
        
        string id = componentNode.Id;
        string title = componentNode.GetAttribute("Title")?.Value ?? componentNode.Id;
        string description = componentNode.GetAttribute("Description")?.Value ?? componentNode.Description;
        description = description.Replace(Environment.NewLine, " ").Trim();
        string technology = componentNode.GetAttribute("Technology")?.Value ?? "";
        
        Append(@$"Container({id}, {title}, {technology}, ""{description}"")");
        
        _renderedIds.Add(componentNode.Id);
    }

    protected override void visitSystemNode(SystemNode systemNode)
    {
        if (_renderedIds.Contains(systemNode.Id)) return;
        //
        string id = systemNode.Id;
        string title = systemNode.GetAttribute("Title")?.Value ?? systemNode.Id;
        string description = systemNode.GetAttribute("Description")?.Value ?? systemNode.Description;
        description = description.Replace(Environment.NewLine, " ").Trim();
        string technology = systemNode.GetAttribute("Technology")?.Value ?? "";
        var contains  = systemNode.GetAttribute("Contains")?.Items ?? new List<string>();
        
        Append($@"System_Boundary({id}, {title}) {{");
        foreach (var item in contains)
        {
            Visit(item);
        }
        Append("}");
        _renderedIds.Add(systemNode.Id);
    }

    protected override void visitEndpointNode(EndpointNode endpointNode)
    {
        //
    }

    protected override void visitRecordNode(RecordNode recordNode)
    {
        //
    }

    protected override void visitChapterNode(MarkdownChapterNode chapterNode)
    {
        //
    }

    protected override void visitParagraphNode(MarkdownParagraphNode paragraphNode)
    {
        //
    }

    protected override void Start()
    {
        //
        Append("!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml");
    }

    protected override void Stop()
    {
        //
        Append("SHOW_LEGEND()");
    }
}