namespace Compiler.Parsers;

public partial class Parser
{
    private void ExtractReferences(List<ComponentAttribute> attributes, Token id)
    {
        var interactions = attributes
            .FirstOrDefault(a => a.Id == "Interactions");
        if (interactions is not null)
        {
            var list = interactions?.Items ?? new List<string>();
            for (var index = 0; index < list.Count; index++)
            {
                var item = list[index];
                References.Add(new NodeReference(id.Value, item, ReferenceType.InteractsWith));
            }
        }
            
        var contains = attributes
            .FirstOrDefault(a => a.Id == "Contains");
        if (contains is not null)
        {
            var list = contains?.Items ?? new List<string>();
            for (var index = 0; index < list.Count; index++)
            {
                var item = list[index];
                References.Add(new NodeReference(id.Value, item, ReferenceType.Contains));
            }
        }
    }
}