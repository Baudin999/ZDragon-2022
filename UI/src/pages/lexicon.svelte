<script>
	import {httpGet} from "../services/http";
	import {fileState} from "../services/file";
	import LanguageTypePill from "../components/LanguageTypePill.svelte";

	export const location = "";
	let basePath;
	let namespaces = [];
	let relations = {};
	let elements = [];
	let selectedNamespace = "";
	let selectedInformationModel;
	
	const getRelations = async (basePath) => {
		relations = await httpGet(`/relations/${encodeURIComponent(basePath)}/type`);
		console.log(relations);
		if (relations['test'] && relations['test'][1])
			console.log(JSON.stringify(4, null, relations['test'][1]));
		
		Object.keys(relations).forEach((key) => {
			namespaces = [...namespaces, key];
		});
	}
	
	const selectNamespace = (namespace) => {
		selectedNamespace = namespace;
		elements = relations[namespace].filter(e => {
			return e.type === "DefinedIn";
		});
	}
	
	const getElementDetails = async (element) => {
		var response = await httpGet(`/module/element/${encodeURIComponent(basePath)}/${element.namespace}/${element.from}`);
		selectedInformationModel = response;
	}
	
	fileState.subscribe(state => {
		if (state.directory && state.directory !== basePath) {
			getRelations(state.directory);
			basePath = state.directory;
		}
	});	
</script>

<div class="container">
	<div class="namespaces">
		{#each namespaces as namespace}
			<div class="namespaces--item" class:selected={namespace === selectedNamespace} on:click={() => selectNamespace(namespace)}>{namespace}</div>
		{/each}
	</div>
	
	<div class="lexicon">
		{#each elements as element}
			{#if element.toToken && element.to && element.to.length > 0}
				<div class="lexicon--item">
					<div>{element.namespace}</div>
					<div>
						{element.fromNodeType}::{element.from} {element.type} {element.toNodeType}::{element.to}
					</div>
				</div>
			{:else}
				<div class="lexicon--item"  on:click={() => getElementDetails(element)}>
					<LanguageTypePill type="{element.fromNodeType}" />
					<div class="lexicon--item--description">{element.from}</div>
				</div>
			{/if}
		{/each}
	</div>
	
	<div class="information">
		{#if selectedInformationModel}
			<pre>{selectedInformationModel.hydratedNode}</pre>
		{/if}
	</div>
</div>


<style lang="less">
	@import "../styles/colors.less";
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;
		
		.namespaces {
			flex: auto;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			
			&--item {
				padding: 0.5rem;
				border-bottom: 1px solid @accent-color;
				cursor: pointer;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: start;
				
				&:hover {
					background-color: @accent-background;
					color: white;
				}
				
				&.selected {
					background-color: @accent-background;
					color: white;
				}
			}
		}
		
		.lexicon {
			flex: auto;
			height: 100%;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			&--item {
				display: flex;
				flex-direction: row;
				justify-content: start;
				padding: 0.5rem;
				border-bottom: 1px solid @accent-color;
				cursor: pointer;

				&--description {
					display: inline-block;
					margin-left: 1rem;
				}

				&:hover {
					background-color: @accent-background;
					color: white;
				}
			}
		}
		
		.information {
			flex: 5;
			height: 100%;
			overflow-y: auto;
			padding: 1rem;
		}
	}
	
</style>