namespace Compiler.Test.ParserTests;

public class TypeDefinitionTests
{
    [Fact]
    public async void SimpleAlias()
    {
        var code = @"
type Id = uuid
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.Empty(zdragon.Errors);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);

        var idNode = (TypeDefinitionNode)zdragon.Nodes[0];
        Assert.Equal("Id", idNode.Id);
        Assert.IsType<IdentifierNode>(idNode.Body);
        var idNodeBody = (IdentifierNode)idNode.Body;
        Assert.Equal("uuid", idNodeBody.Id);
    }
    
    [Fact]
    public async void SimpleTypeApplication()
    {
        var code = @"
type Id = Maybe string
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);

        var idNode = (TypeDefinitionNode)zdragon.Nodes[0];
        Assert.Equal("Id", idNode.Id);

        Assert.IsType<TypeApplicationNode>(idNode.Body);
        var idBody = (TypeApplicationNode)idNode.Body;
        Assert.Equal("Maybe", idBody.Id);
        Assert.Single(idBody.TypeArgs);
        Assert.Equal("string", idBody.TypeArgs[0].Value);
    }
    
    [Fact]
    public async void SimpleTypeDefinition()
    {
        var code = @"
type Add = int -> int -> int
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);

        var addNode = (TypeDefinitionNode)zdragon.Nodes[0];
        Assert.Equal("Add", addNode.Id);
        Assert.IsType<FunctionDefinitionNode>(addNode.Body);
        var addBody = (FunctionDefinitionNode)addNode.Body;
        Assert.Equal(3, addBody.Parameters.Count);
    }
    
    [Fact]
    public async void ComplexTypeDefinition()
    {
        const string code = @"
type Add = (int -> int) -> Maybe string -> int
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);

        var addNode = (TypeDefinitionNode)zdragon.Nodes[0];
        Assert.Equal("Add", addNode.Id);
        Assert.IsType<FunctionDefinitionNode>(addNode.Body);
        var addBody = (FunctionDefinitionNode)addNode.Body;
        Assert.Equal(3, addBody.Parameters.Count);
        
        // first param is a function application
        var firstParam = addBody.Parameters[0];
        Assert.IsType<FunctionDefinitionNode>(firstParam);
        var firstParamFunctionDefinition = (FunctionDefinitionNode)firstParam;
        Assert.Equal(2, firstParamFunctionDefinition.Parameters.Count);
        
        // second parameter is a Type Application
        var secondParam = addBody.Parameters[1];
        Assert.IsType<TypeApplicationNode>(secondParam);
        var secondParamTypeApplication = (TypeApplicationNode)secondParam;
        Assert.Equal("Maybe", secondParamTypeApplication.Id);
        Assert.Single(secondParamTypeApplication.TypeArgs);
        Assert.Equal("string", secondParamTypeApplication.TypeArgs[0].Value);
        
        // third parameter is an Identifier Node
        var thirdParam = addBody.Parameters[2];
        Assert.IsType<IdentifierNode>(thirdParam);
        Assert.Equal("int", ((IdentifierNode)thirdParam).Id);
    }
    
    [Fact(DisplayName = "011 - Serialize type definition")]
    public async void SerializeTypeDefinition()
    {
        const string code = @"
type Add = (int -> int) -> Maybe string -> int
";

        var zdragon = await new ZDragon().Compile(code);
        var json = JsonHelpers.Serialize(zdragon.Nodes[0]);
        var node = JsonHelpers.Deserialize<TypeDefinitionNode>(json);
        Assert.NotNull(node);
        Assert.IsType<FunctionDefinitionNode>(node.Body);
        var addBody = (FunctionDefinitionNode)node.Body;
        Assert.Equal(3, addBody.Parameters.Count);
    }
}