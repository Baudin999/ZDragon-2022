namespace Compiler.Test;

public class ExampleTest
{
    [Fact]
    public void TestSOmething()
    {
        const string code = @"

# Chapter

And a small paragraph which we can
use to write this content.

component Foo =
    Endpoints:
        - AddNumbers_ref

endpoint AddNumbers :: Int -> Int -> Int =
    Title: Add Numbers
    Description:
        # Add Numbers

        Adding numbers is a func thing to
        do, this function can help you 
        with this task.


";

        var zdragon = new ZDragon().Compile(code);
        Assert.Equal(4, zdragon.Nodes.Count);
        
    }
}