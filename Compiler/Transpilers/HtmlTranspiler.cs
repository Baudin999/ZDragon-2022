namespace Compiler.Transpilers;

public class HtmlTranspiler : TranspilationVisitor
{
    protected override void visitComponentNode(ComponentNode componentNode)
    {
        //
    }

    protected override void visitSystemNode(SystemNode systemNode)
    {
        //
    }

    protected override void visitEndpointNode(EndpointNode endpointNode)
    {
        //
    }

    protected override void visitRecordNode(RecordNode recordNode)
    {
        //
    }

    protected override void visitChapterNode(MarkdownChapterNode chapterNode)
    {
        Append($@"<h1>{chapterNode.Content}</h1>");
    }

    protected override void visitParagraphNode(MarkdownParagraphNode paragraphNode)
    {
        Append($@"<p>{paragraphNode.Content}</p>");
    }

    protected override void Start()
    {
        Append(@"
<html>
<head>
<style>
    html, body {
        background: white;
        color: black;
    }
</style>
</head>
<body>

");
    }

    protected override void Stop()
    {
        Append(@"
</body>
</html>
");
    }
}