namespace Compiler;

public class Visitor
{
    public Visitor(List<AstNode> nodes)
    {
        foreach (var node in nodes)
        {
            Visit(node);
        }
    }

    private void visitComponentNode(ComponentNode node)
    {
        Console.WriteLine("ComponentNode: " + node.Id);
        foreach (var attribute in node.Attributes)
        {
            Console.WriteLine(attribute.Id);
        }
    }

    private void Visit(AstNode node)
    {
        switch (node)
        {
            case ComponentNode cn:
                visitComponentNode(cn);
                break;
            default:
                // do nothing
                break;
        } ;
    }
}