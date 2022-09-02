<script>
	var config = null;
	
	fetch("/project")
			.then(r => r.json())
			.then(r => {
				config = r;
			});
	
</script>

<div>
	Editor

	{#if config}
		<div class="config">{config.path}</div>
	{/if}
</div>

<style lang="less">
	@import "./../styles/colors.less";
	
	.config {
		color: @primary-color;
	}
</style>