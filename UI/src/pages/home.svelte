<script>
	import {setDirectory} from "../services/file";

	let path = "";
	
	const submitPath = () => {
		setDirectory(path);
	};
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