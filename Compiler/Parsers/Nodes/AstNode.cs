namespace Compiler.Parsers.Nodes
{
    public abstract class AstNode : ICloneable<AstNode> {
        public string Namespace { get; set; } = "";
        public string Name { get; set; } = "";
        public abstract AstNode Clone();
    }
}
