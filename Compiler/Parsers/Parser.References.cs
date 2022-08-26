namespace Compiler.Parsers;

public partial class Parser
{
    private void ExtractReferences(AstNode node)
    {
        if (node is ComponentNode componentNode)
        {
            References.Add(new NodeReference(componentNode.Id, "", ReferenceType.DefinedIn));
            ExtractReferences(componentNode.Attributes, componentNode.IdToken);
        }
        else if (node is SystemNode systemNode)
        {
            References.Add(new NodeReference(systemNode.Id, "", ReferenceType.DefinedIn));
            ExtractReferences(systemNode.Attributes, systemNode.IdToken);
        }
        else if (node is EndpointNode endpointNode)
        {
            References.Add(new NodeReference(endpointNode.Id, "", ReferenceType.DefinedIn));
            ExtractReferences(endpointNode.Attributes, endpointNode.IdToken);
            ExtractReferences(endpointNode.Operation, endpointNode.IdToken);
        }
        else if (node is RecordNode recordNode)
        {
            References.Add(new NodeReference(recordNode.Id, "", ReferenceType.DefinedIn));
            foreach (var field in recordNode.Attributes)
            {
                foreach (var value in field.TypeTokens)
                {
                    if (!Helpers.BaseTypes.Contains(value.Value))
                    {
                        References.Add(new NodeReference(recordNode.Id, value.Value, ReferenceType.UsedInrecord));
                    }
                }
            }
        }
    }


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

        var model = attributes
            .FirstOrDefault(a => a.Id == "Model");
        if (model is not null)
        {
            References.Add(new NodeReference(id.Value, model.Value, ReferenceType.Aggregate));
        }
    }

    
    private void ExtractReferences(AstNode? expression, Token id)
    {
        if (expression is FunctionDefinitionNode fdn)
        {
            foreach (var parameter in fdn.Parameters)
            {
                ExtractReferences(parameter, id);
            }
        }
        else if (expression is IdentifierNode identifierNode)
        {
            if (!Helpers.BaseTypes.Contains(identifierNode.Id))
            {
                References.Add(new NodeReference(id.Value, identifierNode.Id, ReferenceType.UsedInFunction));
            }
        }
    }
}