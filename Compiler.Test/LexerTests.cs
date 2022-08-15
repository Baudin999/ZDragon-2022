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
            var result = new Lexer(code);
            Assert.NotNull(result);
            Assert.NotEmpty(result.Tokens);
        }
        
        
        [Fact]
        public void SimpleGrouper()
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
            var result = new Lexer(code);
            var tokens = new Grouper(result.Tokens).Group();
            Assert.NotNull(tokens);
            Assert.NotEmpty(tokens);
        }
    }
}