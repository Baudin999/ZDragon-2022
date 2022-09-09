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
        Append($@"<h1>{chapterNode.Value}</h1>");
    }

    protected override void visitParagraphNode(MarkdownParagraphNode paragraphNode)
    {
        Append($@"<p>{paragraphNode.Value}</p>");
    }

    protected override void Start()
    {
        //
    }

    protected override void Stop()
    {
        //
    }
}