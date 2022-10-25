<script>
    import { getContext } from 'svelte';
    import { TABS } from './Tabs.svelte';

    const tab = {};
    const { registerTab, selectTab, selectedTab } = getContext(TABS);

    registerTab(tab);
</script>

<style lang="less">
    @import "./../styles/colors";
    button {
        background: none;
        border: none;
        border-bottom: 2px solid white;
        border-radius: 0;
        margin: 0;
        color: #ccc;
    }

    .selected {
        border-bottom: 4px solid @accent-background;
        color: @accent-background;
    }
</style>

<button class:selected="{$selectedTab === tab}" on:click="{() => selectTab(tab)}">
    <slot></slot>
</button>