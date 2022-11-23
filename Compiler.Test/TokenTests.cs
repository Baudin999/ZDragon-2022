using Compiler;

namespace Compiler.Test;

public class TokenTests
{
    [Fact]
    public void EnumComparison()
    {
        var type = FooEnum.Foo;
        Assert.Equal(FooEnum.Foo, type);
    }

    [Fact(DisplayName = "Token Value Equality")]
    public void TokenValueEquality()
    {
        var code = "hi";
        var lexerResult = new Lexer(code, new ErrorSink()).Lex();
        var hiToken = lexerResult.First();
        var manualHiToken = new Token(TokenKind.Word, "hi", 0, 0, 0, 2);

        Assert.Equal(hiToken, manualHiToken);
    }
    
    [Fact(DisplayName = "Token JSON Equality")]
    public void TokenJsonEquality()
    {
        var code = "hi";
        var lexerResult = new Lexer(code, new ErrorSink()).Lex();
        var hiToken = lexerResult.First();

        var json = JsonHelpers.Serialize(hiToken);
        var newHiToken = JsonHelpers.Deserialize<Token>(json);
        
        Assert.Equal(hiToken, newHiToken);
    }

    [Flags]
    private enum FooEnum
    {
        Foo = 1,
        Bar = 2,
        Bas = 4
    }
}