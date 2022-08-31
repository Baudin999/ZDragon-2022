namespace Compiler.Test.ParserTests;

public class EndpointTests
{
    [Fact]
    public async void SimpleEndpoint()
    {
        const string code = @"
endpoint Foo
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var systemNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);
    }
    
    
    [Fact]
    public async void SimpleEndpointExtensions()
    {
        const string code = @"
endpoint Foo extends Bar 
endpoint Bar
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var systemNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);
        Assert.Single(systemNode.ExtensionTokens);
    }
    
    [Fact]
    public async void EndpointWithOperation()
    {
        const string code = @"
endpoint Add :: Number -> Number -> Number =
    Title: Addition
    Description: Add two numbers
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var endpointNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Add",endpointNode.Id);

        Assert.IsType<FunctionDefinitionNode>(endpointNode.Operation);
        Assert.Equal(2, endpointNode.Attributes.Count);
    }
    
    [Fact]
    public async void EndpointWithOperation2()
    {
        const string code = @"
endpoint Add :: Add =
    Title: Addition
    Description: Add two numbers
type Add = Number -> Number -> Number
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var endpointNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Add",endpointNode.Id);

        Assert.IsType<IdentifierNode>(endpointNode.Operation);
        Assert.Equal(2, endpointNode.Attributes.Count);
    }
    
    [Fact]
    public async void EndpointWithAnnotations()
    {
        const string code = @"
@ This endpoint calculates the addition of two numbers
endpoint Add :: Int -> Int -> Int =
    @ The title of the endpoint
    Title: Addition

    @ The description of the endpoint
    Description: Add two numbers
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var endpointNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Add",endpointNode.Id);
        Assert.Equal(@"This endpoint calculates the addition of two numbers", endpointNode.Description);

        Assert.IsType<FunctionDefinitionNode>(endpointNode.Operation);
        Assert.Equal(2, endpointNode.Attributes.Count);
        
        Assert.Equal("The title of the endpoint", endpointNode.Attributes[0].Description);
        Assert.Equal("The description of the endpoint", endpointNode.Attributes[1].Description);
    }
    
    [Fact]
    public async void EndpointFunctionResultsInReferences()
    {
        const string code = @"
@ This endpoint calculates the addition of two numbers
endpoint Add :: Person -> Guid -> String =
    @ The title of the endpoint
    Title: Addition

    @ The description of the endpoint
    Description: Add two numbers
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);
        var endpointNode = (EndpointNode)zdragon.Nodes[0];

        Assert.Equal(2, zdragon.References.Count);
    }
}