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
            checkReference(reference);
        }

        return _zdragon.Errors;
    }

    private void checkReference(NodeReference nodeReference)
    {
        if (!string.IsNullOrWhiteSpace(nodeReference.To))
        {
            var to = _zdragon.Get(nodeReference.To);
            if (to is null) _zdragon.Errors.Add(new Error(nodeReference.ToToken, @$"Type '{nodeReference.To}' does not exist"));
        }

    }

}