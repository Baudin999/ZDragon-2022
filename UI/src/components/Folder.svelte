<script>
    import File from './File.svelte';

    export let expanded = true;
    export let name;
    export let files = [];

    function toggle() {
        expanded = !expanded;
    }
</script>

<div class="folder-container">
    {#if expanded}
        <i class="fa fa-folder-open-o"></i>
    {:else}
        <i class="fa fa-folder-o"></i>
    {/if}
    
    <span on:click={toggle}>{name}</span>
</div>

{#if expanded}
    <ul>
        {#each files as file}
            <li>
                {#if file.children}
                    <svelte:self name={file.name} files={file.children}/>
                {:else}
                    <File name={file.name} path="{file.path}"/>
                {/if}
            </li>
        {/each}
    </ul>
{/if}

<style>
    .folder-container {
        white-space: nowrap;
    }
    span {
        /*padding: 0 0 0 1.5em;*/
        background-size: 1em 1em;
        font-weight: bold;
        cursor: pointer;
    }

    ul {
        padding: 0.2em 0 0 0.5em;
        margin: 0 0 0 0.5em;
        list-style: none;
    }

    li {
        /*padding: 0.2em 0;*/
    }
</style>