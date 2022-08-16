namespace Compiler.Test;

public class TokenTests
{
    [Fact]
    public void TokenEqualityComparison()
    {
        var type = FooEnum.Foo;
        Assert.Equal(FooEnum.Foo, type);
    }

    [Flags]
    private enum FooEnum
    {
        Foo = 1,
        Bar = 2,
        Bas = 4
    }
}