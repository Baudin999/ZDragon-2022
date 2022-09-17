using System.Text;
using Compiler.Parsers.Nodes;

namespace Compiler.Transpilers;

public class ArchitectureTranspiler : TranspilationVisitor
{
    private List<string> _renderedIds = new List<string>();

    private List<string> _interactions = new();
    
    protected override void visitComponentNode(ComponentNode componentNode)
    {
        if (_renderedIds.Contains(componentNode.Id)) return;
        
        string id = componentNode.Id;
        string title = componentNode.GetAttribute("Title")?.Value ?? componentNode.Id;
        string description = componentNode.GetAttribute("Description")?.Value ?? componentNode.Description;
        description = description.Replace(Environment.NewLine, " ").Trim();
        string technology = componentNode.GetAttribute("Technology")?.Value ?? "";
        
        Append(@$"Container({id}, {title}, {technology}, ""{description}"")");
        
        
        var interactions  = componentNode.GetAttribute("Interactions")?.Items ?? new List<ComponentAttributeListItem>();
        visitInteractions(id, interactions);
        
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
        var contains  = systemNode.GetAttribute("Contains")?.Items ?? new List<ComponentAttributeListItem>();
        
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

    private void visitInteractions(string id, List<ComponentAttributeListItem> interactions)
    {
        foreach (var interaction in interactions)
        {
            _interactions.Add($"Rel({id}, {interaction.Id}, \"{interaction.Title ?? ""}\", \"{interaction.Technology ?? ""}\")");
        }
    }

    protected override void Start()
    {
        //
        Append("!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml");
    }

    protected override void Stop()
    {
        foreach (var interaction in _interactions)
            Append(interaction);
        Append("SHOW_LEGEND()");
    }
}