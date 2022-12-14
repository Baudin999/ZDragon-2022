namespace Compiler.Test.TutorialTests;

public class EasyExamples_Test
{
    /*
       In ZDragon we need to be able to write documentation and
       have this documentation be rendered into a simple A4 format.
       For this purpose we've started to think of Markdown as the
       default with a very simple set of LaTeX like markup features
       for the more advanced cases where you'll need more power to
       render these scenarios.
       
       Let's start with a simple Chapter:
     */
    
    
    [Fact(DisplayName = "01 - Create a markdown chapter")]
    public async void CreateAMarkdownChapter()
    {
        const string code = "# Chapter One";

        var zdragon = await new ZDragon().Compile(code);
        Assert.Single(zdragon.Nodes);
        
        
        // the first, and only, node, should be a MarkdownChapter node
        var chapterNode = zdragon.Nodes[0] as MarkdownChapterNode;
        Assert.IsType<MarkdownChapterNode>(chapterNode);
        Assert.Equal("# Chapter One", chapterNode?.Value);
        Assert.Equal("Chapter One", chapterNode?.Content);
    }
    
    
    /*
       As we've seen form the previous example, a simple chapter
       element is easily created in ZDragon. But what if we'd want to
       style the element?
       
       The syntax in ZDragon is really easy. We can forcefully declare a
       chapter element, give it parameters and add the content:
     */
    
    [Fact(DisplayName = "02 - Create a styled chapter")]
    public async void CreateAStyledChapter()
    {
        const string code = @"
chapter
    [font-weight: bold; color: #12345] 
    { 
        Chapter One 
    }
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.Single(zdragon.Nodes);
        
        
        // the first, and only, node, should be a MarkdownChapter node
        var chapterNode = zdragon.Nodes[0] as MarkdownChapterNode;
        Assert.IsType<MarkdownChapterNode>(chapterNode);
        Assert.Equal("Chapter One", chapterNode?.Value);
        Assert.Equal("Chapter One", chapterNode?.Content);
        
        Assert.Equal(2, chapterNode?.Styles.Count);
        Assert.Equal("font-weight", chapterNode?.Styles[0].Key);
        Assert.Equal("bold", chapterNode?.Styles[0].Value);
        Assert.Equal("color", chapterNode?.Styles[1].Key);
        Assert.Equal("#12345", chapterNode?.Styles[1].Value);
    }
    
    /*
       A paragraph works the same we, we can use the Markdown
       style to create a paragraph in ZDragon
     */

    [Fact(DisplayName = "03 - Create a markdown paragraph")]
    public async void CreateAMarkdownParagraph()
    {
        const string code = @"
This is a paragraph. The paragraph ends when we
have two consecutive newlines after each other.
So this looks like at least an empty line.

This is paragraph two!
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.Equal(2, zdragon.Nodes.Count);
        
        
        // the first, and only, node, should be a MarkdownChapter node
        var paragraphNode = zdragon.Nodes[0] as MarkdownParagraphNode;
        Assert.IsType<MarkdownParagraphNode>(paragraphNode);
        Assert.Equal(@"This is a paragraph. The paragraph ends when we
have two consecutive newlines after each other.
So this looks like at least an empty line.", paragraphNode?.Value);
        Assert.Equal(@"This is a paragraph. The paragraph ends when we
have two consecutive newlines after each other.
So this looks like at least an empty line.", paragraphNode?.Content);

        Assert.IsType<MarkdownParagraphNode>(zdragon.Nodes[1]);
    }
    
    /*
       A styles paragraph is something which we might need. Especially
       in well formatted documents. ZDragon provides a lot "out of the box"
       but sometimes you just want to go that extra step and style your paragraph:
     */
    
    [Fact(DisplayName = "04 - Create a styled paragraph")]
    public async void CreateAStylesParagraph()
    {
        const string code = @"
paragraph
    [
        color:orange;
        font-size: 12px;
        border-color: 1px solid black;
    ] {
    This is a paragraph. The paragraph ends when we
    have two consecutive newlines after each other.
    So this looks like at least an empty line.
}

p [] {
This is paragraph two!
}
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.Equal(2, zdragon.Nodes.Count);
        
        
        // the first, and only, node, should be a MarkdownChapter node
        var paragraphNode = zdragon.Nodes[0] as MarkdownParagraphNode;
        Assert.IsType<MarkdownParagraphNode>(paragraphNode);
        Assert.Equal(@"This is a paragraph. The paragraph ends when we
have two consecutive newlines after each other.
So this looks like at least an empty line.", paragraphNode?.Value);
        Assert.Equal(@"This is a paragraph. The paragraph ends when we
have two consecutive newlines after each other.
So this looks like at least an empty line.", paragraphNode?.Content);
        Assert.Equal(3, paragraphNode?.Styles.Count);
        Assert.Equal("color", paragraphNode?.Styles[0].Key);
        Assert.Equal("orange", paragraphNode?.Styles[0].Value);
        Assert.Equal("font-size", paragraphNode?.Styles[1].Key);
        Assert.Equal("12px", paragraphNode?.Styles[1].Value);
        Assert.Equal("border-color", paragraphNode?.Styles[2].Key);
        Assert.Equal("1px solid black", paragraphNode?.Styles[2].Value);

        Assert.IsType<MarkdownParagraphNode>(zdragon.Nodes[1]);
        var secondParagraphNode = (MarkdownParagraphNode)zdragon.Nodes[1];
        Assert.Empty(secondParagraphNode.Styles);
        Assert.Equal("This is paragraph two!", secondParagraphNode.Value);
        Assert.Equal("This is paragraph two!", secondParagraphNode.Content);
    }
    
    /*
       Inside of our documents we would also like to add simple lists, for the 
       most part, default markdown will suffice. Later in this documentation 
       we will go over other ways of creating lists.
     */
    
    [Fact(DisplayName = "05 - Create a markdown list")]
    public async void CreateAMarkdownList()
    {
        const string code = @"
# Checking out lists!

Lists are conform the markdown spec:

* First Item
* Second Item
    * Second - First sub-item
    * Second - Second sub-item
* Third Item

A numbered list:

1) First
2) Second
3) Third

It is important to end with an empty line...
";

        var zdragon = await new ZDragon().Compile(code);
        Assert.Equal(6, zdragon.Nodes.Count);

        var html = await zdragon.MainPage(false);
       
    }
}