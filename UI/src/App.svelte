<script>
	import { Router, Link, Route } from "svelte-routing";
	import Home from "./pages/home.svelte";
	import About from "./pages/about.svelte";
	import Editor from "./pages/editor.svelte";
	import Lexicon from "./pages/lexicon.svelte";
	
	import Folder from "./components/Folder.svelte";
	
	export let url = "";
	let root = [];
	
	// set the current project path
	fetch("/project",{
		method: 'PUT',
		headers:{
			'Content-Type':'application/json'
		},
		body: JSON.stringify({path: "D:\\BasZDragon"})
	}).then(r => r.json())
			.then(r => {
				root = r;
				console.log(root);
			});


</script>

<main>
	<Router {url}>
		<nav>
			<Link to="/">Home</Link>
			<Link to="about">About</Link>
			<Link to="editor">Editor</Link>
			<Link to="lexicon">Lexicon</Link>
		</nav>
		<div>
			<Route path="editor" component={Editor} />
			<Route path="about" component={About} />
			<Route path="lexicon" component={Lexicon} />
			<Route path="/"><Home /></Route>
		</div>
	</Router>

	<span class="material-symbols-outlined">search</span>
	<span class="material-symbols-outlined">home</span>
	<span class="material-symbols-outlined">settings</span>
	<span class="material-symbols-outlined">favorite</span>
	
	
	<Folder name="Treeview" files={root} expanded />
	
</main>

<style lang="less" global>
	@import "./styles/main.less";
	
</style>
