<script>
    import File from './File.svelte';

    export let expanded = false;
    export let name;
    export let files;

    function toggle() {
        expanded = !expanded;
    }
</script>

<span class:expanded on:click={toggle}>{name}</span>

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
    span {
        padding: 0 0 0 1.5em;
        background-size: 1em 1em;
        font-weight: bold;
        cursor: pointer;
    }

    .expanded {
    }

    ul {
        padding: 0.2em 0 0 0.5em;
        margin: 0 0 0 0.5em;
        list-style: none;
    }

    li {
        padding: 0.2em 0;
    }
</style>