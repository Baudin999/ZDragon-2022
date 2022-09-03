<script>
	import { fileState, setDirectory } from "../services/file";

	let path = "";
	
	const submitPath = () => {
		setDirectory(path);
	};
	
	fileState.subscribe((state) => {
		if (state.directory) {
			path = state.directory;
		}
	});
</script>

<div>
	Home
	
		<input bind:value={path} />
		<button on:click={submitPath}>Submit</button>	
	
</div>


<style lang="less">
	input {
		color: black;
	}
</style>