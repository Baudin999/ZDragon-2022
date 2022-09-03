<script>
	import Editor from "../components/Editor.svelte";
	import { state } from "./../services/code";
	export let location;
	
	// the origin of the navigation, this way we can go back easilly.
	let origin = location.origin;
	
	// the code
	let text = "";
	
	state.subscribe(({ code }) => {
		text = code;
	});
	
</script>

<div>
	<Editor {text} />
</div>

<style lang="less">
	@import "./../styles/colors.less";
	
	.config {
		color: @primary-color;
	}
</style>