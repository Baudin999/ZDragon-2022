namespace Compiler.Test.ParserTests;

public class EndpointTests
{
    [Fact(DisplayName = "001 - Simple Endpoint")]
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
    
    
    [Fact(DisplayName = "002 - Endpoint Extension")]
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

        var endpointNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Foo",endpointNode.Id);
        Assert.Single(endpointNode.ExtensionTokens);
    }
    
    [Fact(DisplayName = "003 - Endpoint with operation")]
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
    
    [Fact(DisplayName = "004 - Endpoint with external operation")]
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
    
    [Fact(DisplayName = "005 - Endpoint with operation and annotations")]
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
    
    [Fact(DisplayName = "006 - Endpoint with errors")]
    public async void EndpointFunctionResultsInReferences()
    {
        const string code = @"
@ This endpoint calculates the addition of two numbers
endpoint Add :: Person -> Guid -> Address =
    @ The title of the endpoint
    Title: Addition

    @ The description of the endpoint
    Description: Add two numbers
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);
        var endpointNode = (EndpointNode)zdragon.Nodes[0];

        Assert.Equal(3, zdragon.References.Count);
        Assert.Equal(2, zdragon.Errors.Count);
        Assert.Equal("Type 'Person' does not exist", zdragon.Errors[0].Message);
        Assert.Equal("Type 'Address' does not exist", zdragon.Errors[1].Message);
    }
    
    [Fact(DisplayName = "007 - Serialization test 01")]
    public async void SerializationTest01()
    {
        const string code = @"
endpoint Add :: Number -> Number -> Number =
    Title: Addition
    Description: Add two numbers
";

        var zdragon = await new ZDragon().Compile(code);

        var json = JsonHelpers.Serialize(zdragon.Nodes[0]);
        var node = JsonHelpers.Deserialize<EndpointNode>(json);
        Assert.NotNull(node);
        Assert.Equal("Add", node.Id);
        Assert.Equal(2, node.Attributes.Count);
    }
}