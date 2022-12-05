<script>
	import {httpGet} from "../services/http";
	import {fileState} from "../services/file";

	export const location = "";
	let basePath;
	let relations = [];


	const getRelations = async (basePath) => {
		relations = await httpGet(`/relations/${encodeURIComponent(basePath)}/type`);
		console.log(relations);
	}
	
	fileState.subscribe(state => {
		if (state.directory && state.directory !== basePath) {
			getRelations(state.directory);
			basePath = state.directory;
		}
	});
	

	
</script>

<div class="container">
	
	<div class="lexicon">
		{#each relations as relation}
			{#if relation.toToken && relation.to && relation.to.length > 0}
				<div class="lexicon--item">
					<div>{relation.namespace}</div>
					<div>
						{relation.fromNodeType}::{relation.from} {relation.type} {relation.toNodeType}::{relation.to}
					</div>
				</div>
			{:else}
				<div class="lexicon--item">
					<div>
						{relation.fromNodeType}::{relation.from} {relation.type} {relation.namespace}
					</div>
				</div>
			{/if}
		{/each}
	</div>
	
	<div class="information">
		aksjdlkjsa
	</div>
</div>


<style lang="less">
	@import "../styles/colors.less";
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;
		
		
		.lexicon {
			width: 30%;
			height: 100%;
			overflow-y: auto;
			&--item {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				padding: 0.5rem;
				border-bottom: 1px solid @accent-background;
			}
		}
		
		.information {
			width: 70%;
			height: 100%;
			overflow-y: auto;
			padding: 1rem;
		}
	}
	
</style>