﻿using Microsoft.AspNetCore.StaticFiles;

namespace UI.Requests;

public class GetProjectFile
{
    public class GetProjectFileRequest : IHttpRequest
    {
        public string BasePath { get; set; } = default!;
        public string CurrentPath { get; set; } = default!;
        public string FileName { get; set; } = default!;
    }

    public class GetProjectFileHandler : IHttpHandler<GetProjectFileRequest>
    {
        public async Task<IResult> Handle(GetProjectFileRequest request, CancellationToken cancellationToken)
        {
            var @namespace = FileHelpers.GenerateNamespaceFromFileName(request.BasePath, request.CurrentPath);
            var path = Path.Combine(request.BasePath, ".out", @namespace, request.FileName);
            var bytes = await FileHelpers.ReadBytesAsync(path);
            new FileExtensionContentTypeProvider().TryGetContentType(request.FileName, out string? contentType);

        
            if (bytes is not null)
            {
                return Results.File(bytes, contentType ?? "application/octet-stream");
            }
            else
            {
                return Results.NotFound();
            }
        }
    }
}