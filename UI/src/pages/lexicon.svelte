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
		}
	});
	

	
</script>

<div>
	{#each relations as relation}
		<div>{JSON.stringify(relation)}</div>
	{/each}
</div>