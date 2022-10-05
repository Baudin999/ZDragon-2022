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
                        References.Add(new NodeReference(recordNode.IdToken, value, ReferenceType.UsedInRecord));
                    }
                }
            }
        }
        else if (node is ViewNode viewNode)
        {
            References.Add(new NodeReference(viewNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn));
            foreach (var child in viewNode.Children)
            {
                References.Add(new NodeReference(viewNode.IdToken, child.IdToken, ReferenceType.ViewedIn));
            }
        }
    }


    private void ExtractReferences(List<ComponentAttribute> attributes, Token id)
    {
        void ParseAttributeContent(ComponentAttribute componentAttribute, ReferenceType referenceType)
        {
            if (componentAttribute.IsList && componentAttribute.Items is not null)
            {
                foreach (var item in componentAttribute.Items)
                {
                    var itemToken = item.IdTokens.Where(r => r == TokenKind.Word)?.Last() ?? Token.EMPTY;
                    References.Add(new NodeReference(id, itemToken, referenceType));
                }
            }
            else
            {
                var list = componentAttribute.ValueTokens ?? new List<Token>();
                foreach (var t in list)
                {
                    References.Add(new NodeReference(id, t, referenceType));
                }
            }
        }

        var interactions = attributes
            .FirstOrDefault(a => a.Id == "Interactions");
        if (interactions is not null && interactions.IsList)
        {
            ParseAttributeContent(interactions, ReferenceType.InteractsWith);
        }
            
        var contains = attributes
            .FirstOrDefault(a => a.Id == "Contains");
        if (contains is not null && contains.IsList)
        {
            ParseAttributeContent(contains, ReferenceType.Contains);
        }

        var model = attributes
            .FirstOrDefault(a => a.Id == "Model");
        if (model is not null && !model.IsList)
        {
            References.Add(new NodeReference(id, model.ValueTokens?.Last() ?? Token.EMPTY, ReferenceType.Aggregate));
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