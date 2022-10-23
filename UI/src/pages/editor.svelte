<script>
	// import components
	import Editor from "../components/Editor.svelte";
	import FileExplorer from "../components/FileExplorer.svelte";
	import { Tabs, Tab, TabList, TabPanel } from './../components/tabs';
	
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
		<FileExplorer />
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
		
		<Tabs class="tabs">
			<TabList>
				<Tab>Page</Tab>
				<Tab>Component Diagram</Tab>
				<Tab>Views</Tab>
			</TabList>
			
			<TabPanel>
				{#if cPath && dir}
					<iframe title="index" src={`/project-file/${dir}/${cPath}/index.html?${time}`} />
				{:else}
					<div>Nothing to see</div>
				{/if}
			</TabPanel>
			<TabPanel>
				{#if cPath && dir}
					<iframe title="result" src={`/project-file/${dir}/${cPath}/components.svg?${time}`} />
				{:else}
					<div>Nothing to see</div>	
				{/if}		
			</TabPanel>
			<TabPanel>
				<div>Views</div>
			</TabPanel>
		</Tabs>
		
		
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
		background: white;
		grid-area: result;
				
		iframe {
			width: 100%;
			height: 100%;
			border: none;
			box-shadow: none;
		}
	}

	:global(.tabs) {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
</style>