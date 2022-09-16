namespace Compiler.Test.ParserTests;

public class SystemTests
{
    [Fact]
    public async void SimpleSystem()
    {
        const string code = @"
system Foo
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<SystemNode>(zdragon.Nodes[0]);

        var systemNode = (SystemNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);
    }
    
    [Fact]
    public async void SystemWithContains()
    {
        const string code = @"
system Foo =
    Contains:
        - PersonComponent
        - ViewComponent
        - OtherComponent
";

        var zdragon = await new ZDragon().Compile(code);

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
        
        // test of the zdragon object contains 3 References, one for each contains
        Assert.Equal(4, zdragon.References.Count);

        var containsReferences = zdragon.References.Skip(1);
        foreach (var item in containsReferences)
        {
            Assert.Equal(ReferenceType.Contains, item.Type);
            Assert.Equal("Foo", item.From);
            
            // not testing the To yet
        }
    }
    
    [Fact]
    public async void SimpleSystemError()
    {
        const string code = @"
system Foo
    Title: Something
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<SystemNode>(zdragon.Nodes[0]);

        var systemNode = (SystemNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);

        Assert.Single(zdragon.Errors);
        Assert.Equal("Expected '=' after 'system'", zdragon.Errors[0].Message);
    }
    
    [Fact]
    public async void ComponentInsideSystem()
    {
        const string code = @"
system Container =
    Contains:
        - ProfileStore

@ The profile Store
component ProfileStore =
    Title: Profile Store
    Description: This is the description 
        of the Profile Store

";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<SystemNode>(zdragon.Nodes[0]);

        var systemNode = (SystemNode)zdragon.Nodes[0];
        Assert.Equal("Container",systemNode.Id);

        Assert.Empty(zdragon.Errors);
    }
}