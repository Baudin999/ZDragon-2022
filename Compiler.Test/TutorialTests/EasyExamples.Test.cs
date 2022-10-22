namespace Compiler.Test.TutorialTests;

public class EasyExamples_Test
{
    /*
     * In ZDragon we need to be able to write documentation and
     * have this documentation be rendered into a simple A4 format.
     * For this purpose we've started to think of Markdown as the
     * default with a very simple set of LaTeX like markup features
     * for the more advanced cases where you'll need more power to
     * render these scenarios.
     *
     * Let's start with a simple Chapter:
     */
    
    
    [Fact(DisplayName = "Create a markdown chapter")]
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
     * As we've seen form the previous example, a simple chapter
     * element is easily created in ZDragon. But what if we'd want to
     * style the element?
     *
     * The syntax in ZDragon is really easy. We can forcefully declare a
     * chapter element, give it parameters and add the content:
     */
    
    [Fact(DisplayName = "Create a styled chapter")]
    public async void CreateAStyledChapter()
    {
        const string code = @"
chapter
    [font-weight: bold; color: red] 
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
        Assert.Equal("red", chapterNode?.Styles[1].Value);
    }

}