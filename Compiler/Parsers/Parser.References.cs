﻿namespace Compiler.Parsers;

public partial class Parser
{
    private void ExtractReferences(AstNode node)
    {
        if (node is ComponentNode componentNode)
        {
            References.Add(new NodeReference(componentNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn, node.Namespace));
            ExtractReferences(componentNode.Attributes, componentNode.IdToken, node.Namespace);
            foreach (var ext in componentNode.ExtensionTokens)
            {
                References.Add(new NodeReference(componentNode.IdToken, ext, ReferenceType.ExtendedBy, componentNode.Namespace));
            }
        }
        else if (node is SystemNode systemNode)
        {
            References.Add(new NodeReference(systemNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn, node.Namespace));
            ExtractReferences(systemNode.Attributes, systemNode.IdToken, node.Namespace);
            foreach (var ext in systemNode.ExtensionTokens)
            {
                References.Add(new NodeReference(systemNode.IdToken, ext, ReferenceType.ExtendedBy, systemNode.Namespace));
            }
        }
        else if (node is EndpointNode endpointNode)
        {
            References.Add(new NodeReference(endpointNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn, node.Namespace));
            ExtractReferences(endpointNode.Attributes, endpointNode.IdToken, node.Namespace);
            ExtractReferences(endpointNode.Operation, endpointNode.IdToken, node.Namespace);
            foreach (var ext in endpointNode.ExtensionTokens)
            {
                References.Add(new NodeReference(endpointNode.IdToken, ext, ReferenceType.ExtendedBy, endpointNode.Namespace));
            }
        }
        else if (node is TypeDefinitionNode typeDefinitionNode)
        {
            if (typeDefinitionNode.Body is not IdentifierNode idNode) return;
            if (!Helpers.BaseTypes.Contains(idNode.Id))
            {
                References.Add(new DataReference(typeDefinitionNode.IdToken, idNode.IdToken, ReferenceType.TypeAlias, node.Namespace));
            }
        }
        else if (node is RecordNode recordNode)
        {
            References.Add(new DataReference(recordNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn, node.Namespace));
            foreach (var field in recordNode.Attributes)
            {
                foreach (var value in field.TypeTokens)
                {
                    if (!Helpers.BaseTypes.Contains(value.Value))
                    {
                        References.Add(new DataReference(recordNode.IdToken, value, ReferenceType.UsedInRecord, node.Namespace));
                    }
                }
            }
            foreach (var ext in recordNode.ExtensionTokens)
            {
                References.Add(new NodeReference(recordNode.IdToken, ext, ReferenceType.ExtendedBy, recordNode.Namespace));
            }
        }
        else if (node is DataNode dataNode)
        {
            References.Add(new DataReference(dataNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn, node.Namespace));
            foreach (var field in dataNode.Fields)
            {
                foreach (var value in field.TypeTokens)
                {
                    if (!Helpers.BaseTypes.Contains(value.Value))
                    {
                        References.Add(new DataReference(dataNode.IdToken, value, ReferenceType.UsedInData, node.Namespace));
                    }
                }
            }
        }
        else if (node is ViewNode viewNode)
        {
            References.Add(new NodeReference(viewNode.IdToken, Token.EMPTY, ReferenceType.DefinedIn, node.Namespace));
            foreach (var child in viewNode.Children)
            {
                References.Add(new NodeReference(viewNode.IdToken, child.IdToken, ReferenceType.ViewedIn, node.Namespace));
            }
        }
    }


    private void ExtractReferences(List<ComponentAttribute> attributes, Token id, string @namespace)
    {
        void ParseAttributeContent(ComponentAttribute componentAttribute, ReferenceType referenceType)
        {
            if (componentAttribute.IsList && componentAttribute.Items is not null)
            {
                foreach (var item in componentAttribute.Items)
                {
                    var itemToken = item.IdTokens.Where(r => r == TokenKind.Word)?.Last() ?? Token.EMPTY;
                    References.Add(new NodeReference(id, itemToken, referenceType, @namespace, item.ReferenceVersionToken));
                }
            }
            else
            {
                var list = componentAttribute.ValueTokens ?? new List<Token>();
                foreach (var t in list)
                {
                    References.Add(new NodeReference(id, t, referenceType, @namespace));
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
            References.Add(new NodeReference(id, model.ValueTokens?.Last() ?? Token.EMPTY, ReferenceType.Aggregate, @namespace));
        }
    }

    
    private void ExtractReferences(AstNode? expression, Token id, string @namespace)
    {
        if (expression is FunctionDefinitionNode fdn)
        {
            foreach (var parameter in fdn.Parameters)
            {
                ExtractReferences(parameter, id, @namespace);
            }
        }
        else if (expression is IdentifierNode identifierNode)
        {
            if (!Helpers.BaseTypes.Contains(identifierNode.Id))
            {
                References.Add(new NodeReference(id, identifierNode.IdToken, ReferenceType.UsedInFunction, @namespace));
            }
        }
    }
}