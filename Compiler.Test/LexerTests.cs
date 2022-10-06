using System.Text.RegularExpressions;
using Compiler.Resolvers;

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
    Version: 0

component Bar
";
            var errorSink = new ErrorSink();
            var result = new Lexer(code, errorSink).Lex();
            Assert.NotNull(result);
            Assert.NotEmpty(result);
            Assert.Empty(errorSink.Errors);
            
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
    Version: 0

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
        public async void TestTokens()
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

            var splits = code.Split("\r\n").Select(r => r + "\r\n").ToList();
            var zdragon = await new ZDragon().Compile(code);
            foreach (var token in zdragon.Lexer?.Tokens ?? new List<Token>())
            {
                if (token == TokenKind.NEWLINE || token.StartLine == -1 ) continue;
                
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
        
        
        [Fact]
        public void TestOpenNamespaces()
        {
            const string code = @"
open Foo
open Something.Other
open Domains.Offering.Data

component Bar =
    Title: Bar
";

            var lexer = new Lexer(code, new ErrorSink());
            lexer.Lex();
            var grouper = new Grouper(lexer.Tokens, new ErrorSink());
            grouper.Group();
            
            Assert.Equal(3, grouper.OpenNamespaces.Count);
            Assert.Equal("Foo", grouper.OpenNamespaces[0]);
            Assert.Equal("Something.Other", grouper.OpenNamespaces[1]);
            Assert.Equal("Domains.Offering.Data", grouper.OpenNamespaces[2]);

        }
        
        [Fact]
        public async void TestModuleResolution()
        {
            const string code = @"
open Foo

component Bar =
    Interactions:
        - Foo
";

            var resolver = new ManualResolver(new Dictionary<string, string>()
            {
                {"Foo", "component Foo"}
            });
            var textModule = new TextModule("Bar", code);
            var zdragon = await new ZDragon(resolver).Compile(textModule);

            Assert.Equal(2, zdragon.References.Count);
            Assert.Single(zdragon.ResolvedModules);
            Assert.Empty(zdragon.Errors);

        }


        [Fact]
        public void TestIndentation()
        {
            const string code = @"
component
    two
        three
            four 
            fourSame
            fourSame2
    five
six
";
            var tokens = new Lexer(code, new ErrorSink()).Lex();
            var groupedTokens = new Grouper(tokens, new ErrorSink()).Group();
        }
        
        
        [Fact]
        public void TestIndentation2()
        {
            const string code = @"
@ This is a large amount
@ of documentation
@ on the Foo component!
component Foo extends Bar Something Other =

    @ The description
    @ of the Foo component
    Description: Multiline
        description
        for Foo

    @ The title of the Foo component
    Title: Foo

    @ Version 2 of the Foo component
    Version: 2
";
            var tokens = new Lexer(code, new ErrorSink()).Lex();
            var groupedTokens = new Grouper(tokens, new ErrorSink()).Group();
            Assert.NotNull(groupedTokens);
        }
        
        [Fact]
        public async void TestStickyComponents()
        {
            const string code = @"
component Foo =    
    Interactions: 
        - Bar
component Bar
";
            var zdragon = await new ZDragon().Compile(code);
            Assert.Equal(2, zdragon.Nodes.Count);
            Assert.IsType<ComponentNode>(zdragon.Nodes[0]);
            Assert.IsType<ComponentNode>(zdragon.Nodes[1]);
        }
        
        [Fact]
        public void TestListItem1()
        {
            const string code = @"
component Foo =    
    Interactions:
        - Bar

        @ The person interaction
        - Person; get the person; HTTP(s); left
        - Animal
";
            var tokens = new Lexer(code, new ErrorSink()).Lex();
            var groupedTokens = new Grouper(tokens, new ErrorSink()).Group();
            var nodes = new Parser(groupedTokens, new ErrorSink(), new List<NodeReference>()).Parse();
           
        }
        
        [Fact]
        public void TestListItem()
        {
            const string code = @"
@ The component Foo
component Foo =
    @ The description
    @ field
    Description: This is a description
        on multiple
        lines
        
    Interactions:

        @ The Bar item
        - Bar

        - Person; get the person; HTTP(s); left
        - Animal

component Bar
component Person
component Animal
";
            var tokens = new Lexer(code, new ErrorSink()).Lex();
            var groupedTokens = new Grouper(tokens, new ErrorSink()).Group();
            var nodes = new Parser(groupedTokens, new ErrorSink(), new List<NodeReference>()).Parse();
            
            
            Assert.Equal(4, nodes.Count);
            Assert.IsType<ComponentNode>(nodes.First());
            var fooNode = (ComponentNode)nodes.First();
            Assert.Equal("The component Foo", fooNode.Description);
            Assert.Equal(2, fooNode.Attributes.Count);

            var descriptionAttribute = fooNode.GetAttribute("Description");
            Assert.NotNull(descriptionAttribute);
            Assert.Equal(@"The description
field", descriptionAttribute?.Description);
        }
        
        

    }
}