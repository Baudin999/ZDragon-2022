<script>
    import { Link } from "svelte-routing";
    import {pathStore} from "../services/locationService";

    export let title;
    export let route;
    export let icon = title.toLowerCase();
    
    let selected = window.location.pathname === route;
    
    pathStore.subscribe(r => {
       selected =  r === route;
    });
        
</script>

<div class="nav-item" class:selected={selected}>
    <Link to="{route}">
        <div class="nav-item--inner">
            <i class="fa fa-{icon}"></i>
            <span>{title}</span>
        </div>
    </Link>
</div>


<style lang="less">
  @import "./../styles/colors";

  .nav-item {
    * {
      transition: all 0.2s ease-in-out;
    }
    text-align: center;

    &--inner {
      margin: 0.5rem;
      padding: 0.5rem;

      i {
        color: @primary-color;
        font-size: 1.5rem;
      }

      .label {
        color: white;
        text-decoration: none;
      }
    }

    &:hover {
      background: @sec-background;
      cursor: pointer;
      text-decoration: none;
    }
    
    &.selected {
      background: @accent-background;
      * {
        color: @accent-color;
      }
    }
  }
</style>