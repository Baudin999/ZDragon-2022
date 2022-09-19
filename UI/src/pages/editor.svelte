<script>
	// import components
	import Editor from "../components/Editor.svelte";
	import FileExplorer from "../components/FileExplorer.svelte";
	
	// import services
	import { fileState } from "../services/file";
	import eventbus from "../services/eventbus";
	
	// declaration
	export let location;
	
	// the origin of the navigation, this way we can go back easilly.
	let origin = location.origin;
	
	// the code
	let text = "";
	
	let time = 1;

	let dir, cPath;
	fileState.subscribe(s => {
		dir = encodeURIComponent(s.directory);
		cPath = encodeURIComponent(s.currentPath);
	});
	
	eventbus.subscribe(eventbus.EVENTS.SAVE_COMPLETED, () => {
		// update the time index by one to reload the page.
		time = time + 1;
	});
		
</script>


<div class="container">
	<div class="treeview">
		<FileExplorer files={$fileState.files} />
	</div>
	<div class="editor">
		<div class="editor-container">
			<div class="editor-header">
				Filename: {$fileState.currentPath}
			</div>
			<div class="editor-middle">
				<Editor text={$fileState.text} />
			</div>
		</div>
	</div>
	<div class="result">
		{#if cPath && dir}
			<iframe title="result" src={`/project-file/${dir}/${cPath}/components.svg?${time}`} />
		{/if}
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
		.editor-container {
			height: 100%;
			display: flex;
			flex-direction: column;
			
			.editor-header {
				flex: 0;
				padding: 0.5rem 0.5rem 0.5rem 30px;
				font-family: monospace;
			}

			.editor-middle {
				flex: 1;
			}
		}
		
	}
	.result {
		grid-area: result;
		
		iframe {
			width: 100%;
			height: 100%;
			border: none;
			box-shadow: none;
		}
	}
</style>