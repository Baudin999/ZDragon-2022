﻿using System.Text;
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
        string? description = componentNode.GetAttribute("Description")?.Value ?? componentNode.Description;
        description = description.Replace(Environment.NewLine, " ").Trim();
        if (description.Length == 0) description = null;

        string? version = componentNode.GetAttribute("Version")?.Value;
        string? technology = componentNode.GetAttribute("Technology")?.Value;
        
        
        Append(formatPlantUmlElement("rectangle", id, title, description, version, technology));
        
        // Append(@$"Container({id}, {title}, {technology}, ""{description}"")");
        //
        //
        // var interactions  = componentNode.GetAttribute("Interactions")?.Items ?? new List<ComponentAttributeListItem>();
        // visitInteractions(id, interactions);
        
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
            if (Has(item.Id))
            {
                Visit(Get(item.Id)!);
            }
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

    protected override void visitViewNode(ViewNode viewNode)
    {
        //
    }

    private void visitInteractions(string id, List<ComponentAttributeListItem> interactions)
    {
        foreach (var interaction in interactions)
        {
            if (Has(interaction.Id))
                _interactions.Add($"Rel({id}, {interaction.Id}, \"{interaction.Title ?? ""}\", \"{interaction.Technology ?? ""}\")");
        }
    }

    protected override List<AstNode> PrepNodes(List<AstNode> astNodes)
    {
        var systemNodes = astNodes.OfType<SystemNode>()
            .OrderByDescending(n =>
            {
                // here we might implement a check to see if the 
                // node contains SystemNode's. If so, we need to render
                // them first
                return n.GetAttribute("Contains")?.Items?.Count ?? 0;
            });
        var otherNodes = astNodes.Where(n => n is not SystemNode);

        return systemNodes.Concat(otherNodes).ToList();
    }

    protected override void Start()
    {
        // order the nodes
        
        //Append("!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml");
        Append(@"
hide stereotype

<style>
rectangle {
   HorizontalAlignment center
}
</style>
");
    }

    protected override void Stop()
    {
        foreach (var interaction in _interactions)
            Append(interaction);
        //Append("SHOW_LEGEND()");
    }
    
    
    private string formatPlantUmlElement(string type, string id, string title, string? description, string? version, string? technology)
    {
        string sub = "";
        if (version is not null && technology is not null)
            sub = $"\\n<size 8>//[v{version},{technology}]//";
        else if (version is not null) 
            sub = $"\\n<size 8>//[v{version}]//";
        else if (technology is not null)
            sub = $"\\n<size 8>//[{technology}]//";

        string wrappedDescription = "";
        if(description is not null) 
            wrappedDescription = "\\n\\n" + wrap(description, "<size 9>");

        return $"{type} \"<b>{title}</b>{sub}{wrappedDescription}\" <<Component>> as {id}";
    }

    private string wrap(string text, string prefix = "", int width = 20)
    {
        string sentence = text;
        sentence = sentence.Replace(Environment.NewLine, " ");
        string[] words = sentence.Split(' ');

        StringBuilder newSentence = new StringBuilder();
        
        string line = "";
        foreach (string word in words)
        {
            if ((line + word).Length > width)
            {
                newSentence.Append(prefix + line.Trim() + "\\n");
                line = "";
            }
            line += string.Format("{0} ", word);
        }

        if (line.Length > 0)
            newSentence.Append(prefix + line.Trim());

        return newSentence.ToString().Trim();
    }
}