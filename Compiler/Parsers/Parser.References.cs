namespace Compiler.Parsers;

public partial class Parser
{
    private void ExtractReferences(AstNode node)
    {
        if (node is ComponentNode componentNode)
        {
            References.Add(new NodeReference(componentNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn));
            ExtractReferences(componentNode.Attributes, componentNode.IdToken);
        }
        else if (node is SystemNode systemNode)
        {
            References.Add(new NodeReference(systemNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn));
            ExtractReferences(systemNode.Attributes, systemNode.IdToken);
        }
        else if (node is EndpointNode endpointNode)
        {
            References.Add(new NodeReference(endpointNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn));
            ExtractReferences(endpointNode.Attributes, endpointNode.IdToken);
            ExtractReferences(endpointNode.Operation, endpointNode.IdToken);
        }
        else if (node is RecordNode recordNode)
        {
            References.Add(new NodeReference(recordNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn));
            foreach (var field in recordNode.Attributes)
            {
                foreach (var value in field.TypeTokens)
                {
                    if (!Helpers.BaseTypes.Contains(value.Value))
                    {
                        References.Add(new NodeReference(recordNode.IdToken, value, ReferenceType.UsedInrecord));
                    }
                }
            }
        }
    }


    private void ExtractReferences(List<ComponentAttribute> attributes, Token id)
    {
        var interactions = attributes
            .FirstOrDefault(a => a.Id == "Interactions");
        if (interactions is not null && interactions.IsList)
        {
            var list = interactions.ValueTokens;
            for (var i = 0; i < list.Count; i++)
            {
                References.Add(new NodeReference(id, list[i], ReferenceType.InteractsWith));
            }
        }
            
        var contains = attributes
            .FirstOrDefault(a => a.Id == "Contains");
        if (contains is not null && contains.IsList)
        {
            var list = contains.ValueTokens;
            for (var i = 0; i < list.Count; i++)
            {
                var item = list[i];
                References.Add(new NodeReference(id, list[i], ReferenceType.Contains));
            }
        }

        var model = attributes
            .FirstOrDefault(a => a.Id == "Model");
        if (model is not null && !model.IsList)
        {
            References.Add(new NodeReference(id, model.ValueToken, ReferenceType.Aggregate));
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
                References.Add(new NodeReference(id, identifierNode.IdToken, ReferenceType.UsedInFunction));
            }
        }
    }
}