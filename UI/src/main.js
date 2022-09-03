import App from './App.svelte';


// INIT MONACO
import { theme, tokenizer } from "./editor-carlang.js";
monaco.languages.register({ id: "carlang" });
monaco.languages.setMonarchTokensProvider("carlang", tokenizer);
monaco.editor.defineTheme("carlangTheme", theme);


// init the key_trap
import initKeyTrap from "./key_trap";
initKeyTrap();

import { init } from "./services/file";
init();

const app = new App({
	target: document.body,
	props: {
		
	}
});

export default app;