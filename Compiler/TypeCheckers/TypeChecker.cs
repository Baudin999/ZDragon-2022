namespace Compiler.TypeCheckers;

public class TypeChecker
{
    private readonly ZDragon _zdragon;
    public TypeChecker(ZDragon zdragon)
    {
        _zdragon = zdragon;
    }

    public List<Error> Check()
    {
        // this function will check all the relations in the 
        // zdragon module and will try and see if every node
        // or relationship is defined.

        foreach (var reference in _zdragon.References)
        {
            if (reference is DataReference dr) checkDataReference(dr);
            else checkReference(reference);
        }

        return _zdragon.Errors;
    }

    private void checkReference(NodeReference nodeReference)
    {
        if (!string.IsNullOrWhiteSpace(nodeReference.To) && nodeReference.ToToken is not null)
        {
            var to = _zdragon.Get(nodeReference.To);
            if (to is null)
            {
                _zdragon.Errors.Add(new Error(nodeReference.ToToken, @$"Type '{nodeReference.To}' does not exist"));
            }
            else
            {
                var nodeType = to.GetType().Name;
                nodeReference.ToNodeType = nodeType;
                
                if (nodeReference.VersionToken is not null && to is AttributesNode<ComponentAttribute> an)
                {
                    var attribute = an.GetAttribute("Version");
                    if (attribute is not null && attribute.Value.Trim() != nodeReference.VersionToken.Value.Trim())
                    {
                        var error = new Error(nodeReference.ToToken, $"The interaction on the '{nodeReference.From}' component, references a non existent version of the '{nodeReference.To}' component.");
                        _zdragon.Errors.Add(error);
                    }
                }
            }
        }

    }


    private void checkDataReference(DataReference dr)
    {
        if (!string.IsNullOrWhiteSpace(dr.To) && dr.ToToken is not null)
        {
            var to = _zdragon.Get(dr.To);
            if (to is null) _zdragon.Errors.Add(new Error(dr.ToToken, @$"Type '{dr.To}' does not exist"));
            else if (to is not IDataNode) _zdragon.Errors.Add(new Error(dr.ToToken, @$"Type '{dr.To}' is not a data node and as such cannot be used as a reference.")); 
        }
    }

}