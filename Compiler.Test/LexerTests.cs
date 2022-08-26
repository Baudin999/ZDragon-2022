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

This if is not a keyword!
";
            var errorSink = new ErrorSink();
            var tokens = new Lexer(code, errorSink).Lex();
            var groupedTokens = new Grouper(tokens, errorSink).Group();
            Assert.NotNull(groupedTokens);
            Assert.NotEmpty(groupedTokens);
        }


        [Fact]
        public void TestTokens()
        {
            const string code = @"

# This is the Foo component  

This is a paragraph, these paragraphs
are a part of the application.

component Foo =
    Title: Foo
    Description: This is the 
        Foo component.
    Version: 0

component Bar
";

            var splits = code.Split('\n');
            var zdragon = new ZDragon().Compile(code);
            foreach (var token in zdragon.Lexer?.Tokens ?? new List<Token>())
            {
                if (token == TokenType.NEWLINE || token.StartLine == -1 ) continue;
                
                var line = splits[token.StartLine];
                var s = line.Substring(token.StartColumn, token.EndColumn - token.StartColumn);
                Assert.Equal(token.Value, s);
            }
            
        }

        [Fact]
        public void TestCharacters()
        {
            const string code = "!@#$%^&*()_+=-`~'\":;[]{},./?><\\|";

            var lexer = new Lexer(code, new ErrorSink());
            lexer.Lex();
            
            Assert.Equal(33, lexer.Tokens.Count);

        }
    }
}