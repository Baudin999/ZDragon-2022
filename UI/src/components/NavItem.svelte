
<script>
    import { Link } from "svelte-routing";
    export let title;
    export let route;
    export let icon = title.toLowerCase();
</script>

<div>
    <i class="fa fa-{icon}"></i>
    <Link to="{route}">{title}</Link>
</div>