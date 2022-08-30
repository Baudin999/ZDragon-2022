namespace Compiler.Test.ParserTests;

public class FunctionDefinitionTests
{
    [Fact]
    public async void SimpleAddFunctionDefinition()
    {
        const string code = @"
let Add x y =
    x + y
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }

    [Fact]
    public async void SimpleNonParamFunction()
    {
        const string code = @"
let foo () = 2
";
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }
    
    [Fact]
    public async void SimpleFunctionApplicationExpression()
    {
        const string code = @"
let foo () =
    Add 2 3
";
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);

        Assert.IsType<FunctionNode>(zdragon.Nodes[0]);
        var assignment = (FunctionNode)zdragon.Nodes[0];
        Assert.Equal("foo", assignment.Id);

        // TODO: test for a function application expression
    }
    
    [Fact]
    public async void AssignmentOfNumber()
    {
        const string code = @"
let n = 2
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }
    
    [Fact]
    public async void ArgumentOfString()
    {
        const string code = @"
let n = ""Carlos and Femke""
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);

        Assert.IsType<AssignmentExpression>(zdragon.Nodes[0]);
        var assignment = (AssignmentExpression)zdragon.Nodes[0];
        Assert.Equal("n", assignment.Id);
        Assert.IsType<StringLiteralExpression>(assignment.Body);
        Assert.Equal("Carlos and Femke", ((StringLiteralExpression)assignment.Body).Value);
    }
    
    [Fact]
    public async void CombineDocumentationAndFunction()
    {
        const string code = @"
# Creating the system

This module works on creating a system which
will add two numbers.

type Add = int -> int -> int
let Add x y =
    x + y

component Math =
    Title: Math component
    Operations:
        - Add
";

        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);

        Assert.Equal(5, zdragon.Nodes.Count);
    }
}