import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		isOpen: true
	}
});

export default app;