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

<div class="lexicon">
	{#each relations as relation}
		{#if relation.to && relation.to.length > 0}
			<div class="lexicon--item">
				<div>{relation.namespace}</div>
				<div>
					{relations.nodeType} {relation.from} {relation.type} {relation.to}
				</div>
			</div>
		{:else}
			<div class="lexicon--item">
				<div>{relation.namespace}</div>
				<div>
					{relations.nodeType} {relation.from} {relation.type} {relation.namespace}
				</div>
			</div>
		{/if}
	{/each}
</div>


<style lang="less">
	@import "../styles/colors.less";
	.lexicon {
		&--item {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding: 0.5rem;
			border-bottom: 1px solid @accent-background;
		}
	}
	
</style>