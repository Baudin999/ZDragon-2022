using Markdig;

namespace Compiler.Transpilers;

public class HtmlTranspiler : TranspilationVisitor
{
    private MarkdownPipeline pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();
    
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
        Append(Markdown.ToHtml(chapterNode.Value, pipeline));
    }

    protected override void visitParagraphNode(MarkdownParagraphNode paragraphNode)
    {
        if (paragraphNode.Content.StartsWith("*"))
        {
            visitListNode(paragraphNode);   
        }
        else if (paragraphNode.Content.StartsWith("1"))
        {
            visitListNode(paragraphNode);
        }
        else
        {
            Append(Markdown.ToHtml(paragraphNode.Value, pipeline));
        }
        
    }

    protected override void visitViewNode(ViewNode viewNode)
    {
        Append(@$"<img src=""{viewNode.Id}.svg"" als=""{viewNode.Id}"" />");
    }

    private void visitListNode(MarkdownParagraphNode listNode)
    {
        Append(Markdown.ToHtml(listNode.Content, pipeline));
    }

    protected override void Start()
    {
        Append(@"
<!DOCTYPE html>
<html>
<head>
    <style>
        *, *:before, *:after {
            box-sizing: border-box;
        }
        html, body {
            background: white;
            color: black;
            font-family: 'Computer Modern Sans', sans-serif;
            font-size: 14px;
            background: lightgray;
        }
        body {
            padding: 1rem;
        }
        .page {

            margin-left: auto;
            margin-right: auto;

            min-width: 210mm;
            max-width: 210mm;
            width: 210mm!important;

            min-height: 297mm;

            padding: 22mm!important;
            border: 1px solid gray;

            background: white;
        }
        .page img {
            max-width: 100%;
        }
    </style>

    <link rel=""stylesheet"" 
        href=""https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/katex.min.css"" 
        integrity=""sha384-Juol1FqnotbkyZUT5Z7gUPjQ9gzlwCENvUZTpQBAPxtusdwFLRy382PSDx5UUJ4/"" 
        crossorigin=""anonymous"">

    <script 
        defer 
        src=""https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/katex.min.js"" 
        integrity=""sha384-97gW6UIJxnlKemYavrqDHSX3SiygeOwIZhwyOKRfSaf0JWKRVj9hLASHgFTzT+0O"" 
        crossorigin=""anonymous""></script>

    <script defer 
        src=""https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/contrib/auto-render.min.js"" 
        integrity=""sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"" 
        crossorigin=""anonymous""
        onload=""renderMathInElement(document.body);""></script>


    <link rel=""stylesheet""
          href=""//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css"">
    <script src=""//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js""></script>
</head>
<body>

<div class=""page"">


");
    }

    protected override void Stop()
    {
        Append(@"
    <h1>Component Diagram</h1>
    <div>
        <img src=""components.svg"" alt=""components.svg""/>
    </div>
</div>
    <script>
        hljs.highlightAll();
    </script>
</body>
</html>
");
    }
}