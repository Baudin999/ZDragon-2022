<script>
	// import components
	import Editor from "../components/Editor.svelte";
	import FileExplorer from "../components/FileExplorer.svelte";
	
	// import services
	import { fileState } from "../services/file";
	
	// declaration
	export let location;
	
	// the origin of the navigation, this way we can go back easilly.
	let origin = location.origin;
	
	// the code
	let text = "";

	fileState.subscribe(state => {
		console.log(state);
		text = state.text;
	});

	
</script>

<div class="container">
	<div class="treeview">
		<FileExplorer />
	</div>
	<div class="editor">
		<Editor {text} />
	</div>
	<div class="result">
		Result
	</div>
</div>

<style lang="less">
	.container {
		display: grid;
		grid-template-columns: 1fr 3fr 3fr;
		grid-template-rows: 1fr;
		grid-template-areas: "treeview editor result";
		height: 100%;
	}
	.treeview {
		grid-area: treeview;
		overflow: auto;
	}
	.editor {
		grid-area: editor;
	}
	.result {
		grid-area: result;
	}
</style>