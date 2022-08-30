// See https://aka.ms/new-console-template for more information


string basePath = Environment.GetCommandLineArgs()[1];

new Compiler.FileWatcher().Start(basePath);