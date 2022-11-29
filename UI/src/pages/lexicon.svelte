<script>
	import {httpGet} from "../services/http";
	import {fileState} from "../services/file";

	export const location = "";
	let basePath;


	const getRelations = async (basePath) => {
		var relations = await httpGet(`/relations/${encodeURIComponent(basePath)}/type`);
		console.log(relations);
	}
	
	fileState.subscribe(state => {
		console.log(state)
		if (state.directory && state.directory !== basePath) {
			getRelations(state.directory);
		}
	});
	

	
</script>

<div>
	Lexicon
</div>