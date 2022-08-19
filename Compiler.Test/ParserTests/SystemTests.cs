namespace Compiler.Test.ParserTests;

public class SystemTests
{
    [Fact]
    public void SimpleSystem()
    {
        const string code = @"
system Foo
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<SystemNode>(zdragon.Nodes[0]);

        var systemNode = (SystemNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);
    }
    
    [Fact]
    public void SystemWithContains()
    {
        const string code = @"
system Foo =
    Contains:
        - PersonComponent
        - ViewComponent
        - OtherComponent
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<SystemNode>(zdragon.Nodes[0]);

        var systemNode = (SystemNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);

        Assert.Single(systemNode.Attributes);
        Assert.True(systemNode.Attributes[0].IsList);
        Assert.Equal(3, systemNode.Attributes[0].Items?.Count);
        Assert.Equal("PersonComponent", systemNode.Attributes[0].Items?[0]);
        Assert.Equal("ViewComponent", systemNode.Attributes[0].Items?[1]);
        Assert.Equal("OtherComponent", systemNode.Attributes[0].Items?[2]);
    }
}