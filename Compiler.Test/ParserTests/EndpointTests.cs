﻿namespace Compiler.Test.ParserTests;

public class EndpointTests
{
    [Fact]
    public void SimpleEndpoint()
    {
        const string code = @"
endpoint Foo
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var systemNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);
    }
    
    
    [Fact]
    public void SimpleEndpointExtensions()
    {
        const string code = @"
endpoint Foo extends Bar 
endpoint Bar
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var systemNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Foo",systemNode.Id);
        Assert.Single(systemNode.Extends);
    }
    
    [Fact]
    public void EndpointWithOperation()
    {
        const string code = @"
endpoint Add :: Number -> Number -> Number =
    Title: Addition
    Description: Add two numbers
";

        var zdragon = new ZDragon().Compile(code);

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
    public void EndpointWithOperation2()
    {
        const string code = @"
endpoint Add :: Add =
    Title: Addition
    Description: Add two numbers
type Add = Number -> Number -> Number
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon);
        Assert.NotNull(zdragon.Nodes);
        Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<EndpointNode>(zdragon.Nodes[0]);

        var endpointNode = (EndpointNode)zdragon.Nodes[0];
        Assert.Equal("Add",endpointNode.Id);

        Assert.IsType<IdentifierNode>(endpointNode.Operation);
        Assert.Equal(2, endpointNode.Attributes.Count);
    }
}