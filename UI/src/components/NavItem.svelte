<script>
    import { Link } from "svelte-routing";

    export let title;
    export let route;
    export let icon = title.toLowerCase();
    
    let selected = window.location.pathname === route;
    
    
</script>

<div class="nav-item" class:selected={selected}>
    <div class="nav-item--inner">
        <i class="fa fa-{icon}"></i>
        <Link class="label" to="{route}">{title}</Link>
    </div>
</div>


<style lang="less">
  @import "./../styles/colors";

  .nav-item {
    text-align: center;

    &--inner {
      margin: 0.5rem;
      padding: 0.5rem;

      i {
        color: @primary-color;
        font-size: 1.5rem;
      }

      .label {
        color: white!important;
        text-decoration: none;
      }
    }

    &:hover {
      background: @sec-background;
      cursor: pointer;
    }
    
    &.selected {
      background: green;
    }
  }
</style>