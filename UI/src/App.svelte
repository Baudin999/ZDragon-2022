<script>
    import {Router, Link, Route} from "svelte-routing";
    import Home from "./pages/home.svelte";
    import About from "./pages/about.svelte";
    import Editor from "./pages/editor.svelte";
    import Lexicon from "./pages/lexicon.svelte";
    import {Modals} from "svelte-modals";
    import NavItem from "./components/NavItem.svelte";
    import initLocationService from "./services/locationService";

    export let url = "";
    initLocationService();
</script>

<main>
    <div class="container">
        <div class="root header">
            ZDragon
        </div>
        <div class="root middle">
            <Router {url}>
                <div class="navigation">
                    <nav>
                        <NavItem icon="home" title="Home" route="/"/>
                        <NavItem icon="pencil" title="Editor" route="/editor"/>
                        <NavItem icon="book" title="Lexicon" route="/lexicon"/>
                        <NavItem icon="question" title="About" route="/about"/>
                    </nav>
                </div>
                <div class="main-content">
                    <div class="main-container">
                        <Route path="editor" component={Editor}/>
                        <Route path="about" component={About}/>
                        <Route path="lexicon" component={Lexicon}/>
                        <Route path="/">
                            <Home/>
                        </Route>
                    </div>
                </div>
            </Router>
        </div>
        <div class="root footer">
            Footer
        </div>

        <Modals/>

    </div>

    <div class="small" style="display: none;"></div>
</main>

<style lang="less" global>
  @import "./styles/main.less";

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .root.header, .root.footer {
      padding: 0.5rem;
      flex: 0;
    }

    .root.header {
      background: @sec-background;
    }

    .root.middle {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: row;
      background: @primary-background;

      .navigation {
        flex: 0;
      }

      .main-content {
        flex: 1;
        height: 100%;
        overflow: hidden;

        .main-container {
          height: 100%;
          margin-left: 1rem;
          margin-right: 1rem;
          overflow: hidden;
        }
      }
    }

    .small {
      font: normal 10px sans-serif;
    }
    .medium {
      font: normal 13px sans-serif;
    }
    .large {
      font: normal 16px sans-serif;
    }

  }
</style>
