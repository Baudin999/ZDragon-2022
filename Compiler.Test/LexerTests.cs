namespace Compiler.Test
{
    public class LexerTests
    {
        [Fact]
        public void SimpleLexing()
        {
            var code = @"

# This is the Foo component  

This is a paragraph, these paragraphs
are a part of the application.

component Foo =
    Title: Foo
    Description: This is the 
        Foo component.
    Verion: 0

component Bar
";
            var errorSink = new ErrorSink();
            var result = new Lexer(code, errorSink).Lex();
            Assert.NotNull(result);
            Assert.NotEmpty(result);
        }
        
        
        [Fact]
        public void SimpleGrouper()
        {
            var code = @"
component Foo =
    Title: Foo
    Description: This is the 
        Foo component. With
        another line to check
    Verion: 0

component Bar
";
            var errorSink = new ErrorSink();
            var tokens = new Lexer(code, errorSink).Lex();
            var groupedTokens = new Grouper(tokens, errorSink).Group();
            Assert.NotNull(groupedTokens);
            Assert.NotEmpty(groupedTokens);
        }


        [Fact]
        public void LexingSimpleIf()
        {
            var code = @"
let foo x y =
    if x < y
        This is meaningless
        return x
    else 
        return y
";
            var errorSink = new ErrorSink();
            var tokens = new Lexer(code, errorSink).Lex();
            var groupedTokens = new Grouper(tokens, errorSink).Group();
            Assert.NotNull(groupedTokens);
            Assert.NotEmpty(groupedTokens);
        }
    }
}