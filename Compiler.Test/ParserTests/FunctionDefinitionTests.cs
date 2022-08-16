namespace Compiler.Test.ParserTests;

public class FunctionDefinitionTests
{
    [Fact]
    public void SimpleAddFunctionDefinition()
    {
        const string code = @"
let Add x y =
    x + y
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }

    [Fact]
    public void SimpleNonParamFunction()
    {
        const string code = @"
let foo () = 2
";
        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }
    
    [Fact]
    public void SimpleFunctionApplicationExpression()
    {
        const string code = @"
let foo () =
    Add 2 3
";
        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }
    
    [Fact]
    public void AssignmentOfNumber()
    {
        const string code = @"
let n = 2
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
    }
    
    [Fact]
    public void CombineDocumentationAndFunction()
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

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);

        Assert.Equal(5, zdragon.Nodes.Count);
    }
}