namespace Compiler.Test.ParserTests
{
    public class ComponentTests
    {
        
        [Fact(DisplayName = "001 - Simple Component")]
        public async void SimpleComponent()
        {
            const string code = @"
component Foo
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
        }

        [Fact(DisplayName = "002 - Component should have an Identifier")]
        public async void ComponentShouldHaveAnIdentifier()
        {
            const string code = @"component";
            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.Empty(zdragon.Nodes);
            Assert.NotNull(zdragon.Errors);
            Assert.Single(zdragon.Errors);

            Assert.Equal(@"A component should have an Identifier to name the component, for example:

component Foo

Where 'Foo' is the identifier of the component.", zdragon.Errors[0].Message);
            Assert.Equal(0, zdragon.Errors[0].Source.StartLine);
            Assert.Equal(0, zdragon.Errors[0].Source.EndLine);
            Assert.Equal(0, zdragon.Errors[0].Source.StartColumn);
            Assert.Equal(9, zdragon.Errors[0].Source.EndColumn);
        }

        [Fact(DisplayName = "003 - Simple component 02")]
        public async void SimpleComponent2()
        {
            const string code = @"
component Foo =
    Title: Foo
    Description: This is the
        Foo component.
    Version: 0
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(3, fooNode.Attributes.Count);
        }
        
        [Fact (DisplayName = "004 - Simple component 03")]
        public async void SimpleComponent3()
        {
            const string code = @"
component Foo =
    Title: Foo
    Description: This is the
        Foo component. And let's
        do some more lines
        To test the items
    Version: 0
    Notes:
        # Chapter
        
        With a paragraph.
    Model: Person
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(5, fooNode.Attributes.Count);
        }

        [Fact (DisplayName = "005 - Single interaction")]
        public async void TestInteractions()
        {
            const string code = @"
component Foo =
    Interactions:
        - Bar
";
            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
            
            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Single(fooNode.Attributes);
            Assert.Equal(2, zdragon.References.Count);

            var reference = zdragon.References[1];
            Assert.Equal("Foo", reference.From);
            Assert.Equal("Bar", reference.To);
            Assert.Equal(ReferenceType.InteractsWith, reference.ReferenceType);

            Assert.Single(zdragon.Errors);
        }

        [Fact(DisplayName = "006 - Extend component")]
        public async void ExtendComponent()
        {
            const string code = @"
component Foo extends Bar Other =
    Version: 10

component Bar =
    Title: Bar Component

component Other =
    Version: 0
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
            Assert.Equal(3, zdragon.Nodes.Count);
            Assert.Equal(5, zdragon.References.Count);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(2, fooNode.ExtensionTokens.Count);
            Assert.Equal(2, fooNode.Attributes.Count);
            Assert.Equal("Version", fooNode.Attributes[0].Id);
            Assert.Equal("10", fooNode.Attributes[0].Value);
            Assert.Equal("Title", fooNode.Attributes[1].Id);
            Assert.Equal("Bar Component", fooNode.Attributes[1].Value);
        }
        
        [Fact(DisplayName = "007 - Component with a list attribute")]
        public async void ComponentListAttribute()
        {
            const string code = @"
component JusticeLeague =
    Members:
        - Superman
        - Batman
        - Tech Man
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var justiceLeagueNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("JusticeLeague", justiceLeagueNode.Id);
            Assert.Single(justiceLeagueNode.Attributes);

            var members = justiceLeagueNode.Attributes[0];
            Assert.NotNull(members);
            Assert.True(members.IsList);
            Assert.Equal(3, members.Items?.Count);
            Assert.Equal("Superman", members.Items?[0].Id);
            Assert.Equal("Batman", members.Items?[1].Id);
            Assert.Equal("Tech Man", members.Items?[2].Id);
        }

        [Fact(DisplayName = "008 - Component with annotations")]
        public async void ComponentWithAnnotations()
        {
            const string code = @"
@ The Justice League
@ of America
component JusticeLeague =
    @ The current members of the JL
    Members:
        @ Clark Kent
        - Superman
        
        @ Bruce Wayne
        - Batman
        
        @ Diana Prince
        - Wonder Woman
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var justiceLeagueNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("JusticeLeague", justiceLeagueNode.Id);
            Assert.Single(justiceLeagueNode.Attributes);
            Assert.Equal(@"The Justice League
of America", justiceLeagueNode.Description);

            var members = justiceLeagueNode.Attributes[0];
            Assert.NotNull(members);
            Assert.True(members.IsList);
            Assert.Equal(3, members.Items?.Count);
            Assert.Equal("Superman", members.Items?[0].Id);
            Assert.Equal("Batman", members.Items?[1].Id);
            Assert.Equal("Wonder Woman", members.Items?[2].Id);
        }

        [Fact(DisplayName = "009 - Component with markdown notes")]
        public async void ComponentWithMarkdownNotes()
        {
            const string code = @"
component Foo =
    Notes:
        # These are the notes
        
        And with these notes we can
        write anything we want:

         * Bullet 1
         * Bullet 2
            * Indent 1
         * Bullet 3
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.Single(zdragon.Nodes);
            
            var foo = (ComponentNode)zdragon.Nodes[0];
            Assert.Single(foo.Attributes);
            var attribute = foo.Attributes[0];
            Assert.Equal("Notes", attribute.Id);
            Assert.Equal(@"# These are the notes

And with these notes we can
write anything we want:

 * Bullet 1
 * Bullet 2
    * Indent 1
 * Bullet 3", attribute.Value);
        }
        
        [Fact(DisplayName = "010 - Component Version Checking - 01")]
        public async void ComponentVersionChecking_01()
        {
            const string code = @"
component Foo =
    Version: v01

component Bar =
    Interactions:
        - Foo::v01
";

            var zdragon = await new ZDragon().Compile(code);
            Assert.Equal(2, zdragon.Nodes.Count);

            var barNode = (ComponentNode)zdragon.Nodes[1];
            Assert.Single(barNode.Attributes);
            var interactions = barNode.Attributes[0].Items ?? new List<ComponentAttributeListItem>();
            Assert.Single(interactions);
            var fooInteraction = interactions.First();
            Assert.Equal("Foo", fooInteraction.Id);
            Assert.Equal("v01", fooInteraction.ReferenceVersionToken?.Value);

            Assert.Empty(zdragon.Errors);
        }
        
        [Fact(DisplayName = "011 - Component Version Checking - 02")]
        public async void ComponentVersionChecking_02()
        {
            const string code = @"
component Foo =
    Version: v01

component Bar =
    Interactions:
        - Foo::v02
";

            var zdragon = await new ZDragon().Compile(code);
            Assert.Equal(2, zdragon.Nodes.Count);

            var barNode = (ComponentNode)zdragon.Nodes[1];
            Assert.Single(barNode.Attributes);
            var interactions = barNode.Attributes[0].Items ?? new List<ComponentAttributeListItem>();
            Assert.Single(interactions);
            var fooInteraction = interactions.First();
            Assert.Equal("Foo", fooInteraction.Id);
            Assert.Equal("v02", fooInteraction.ReferenceVersionToken?.Value);

            Assert.Single(zdragon.Errors);
            Assert.Equal("The interaction on the 'Bar' component, references a non existent version of the 'Foo' component.", zdragon.Errors[0].Message);
        }

        [Fact(DisplayName = "012 - Clone Component")]
        public async void CloneComponent() 
        {
            const string code = @"
component Foo =
    Version: v01
";
            var zdragon = await new ZDragon().Compile(code);
            Assert.Single(zdragon.Nodes);
            var componentNode = (ComponentNode)zdragon.Nodes[0];
            Assert.NotNull(componentNode);
            if (componentNode is not null)
            {
                var clone = componentNode.Clone();
                Assert.Equal(componentNode.Id, clone.Id);
                var equals = componentNode.GetAttribute("Version")?.Equals(clone.GetAttribute("Version"));
                Assert.True(equals);
            }

        }
        
        [Fact(DisplayName = "013 - Hydrate Component")]
        public async void HydrateComponent() 
        {
            const string code = @"
@ The Foo component's annotations
@ This will span multiple lines
component Foo =
    @ The Foo component
    Title: Foo

    Description: I would love to see
        the description span multiple lines
        as well.

    @ The 1st version
    Version: v01

    Interactions:
        - Bar
        - Baz
";
            var zdragon = await new ZDragon().Compile(code);
            Assert.Single(zdragon.Nodes);
            var componentNode = (ComponentNode)zdragon.Nodes[0];
            Assert.NotNull(componentNode);
            if (componentNode is not null)
            {
                string definition = componentNode.Hydrate();
                Assert.NotNull(definition);
                Assert.NotEmpty(definition);

                Assert.Equal(@"
@ The Foo component's annotations
@ This will span multiple lines
component Foo =
    @ The Foo component
    Title: Foo
    Description: I would love to see
        the description span multiple lines
        as well.
    @ The 1st version
    Version: v01
    Interactions: 
        - Bar
        - Baz
".Trim(), definition);
            }

        }
    }
}
