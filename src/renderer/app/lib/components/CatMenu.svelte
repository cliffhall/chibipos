<script>
	import { selectedCat } from '$lib/stores/shared.svelte.js';
	let { cats } = $props();
	import { invalidateAll } from '$app/navigation';

</script>

<div class="catmenu">
	{#each cats as cat}
		<button onclick={() => selectedCat.cat = cat.id} class='{selectedCat.cat === cat.id ? 'selected' : ''}'>{cat.name}</button>
	{/each}
</div>

<style lang="scss">
	.catmenu {
		padding: var(--panel-padding);
		background: linear-gradient(var(--color-panel1), var(--color-panel2));
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	button {
		height: var(--button-height);
		display: block;
		border-radius: 15px;
		font-family: var(--font-titles);
		font-size: 1.125em;
		letter-spacing: 0.5px;
		width: 100%;
		padding: 0em 1em;
		color: var(--color-accent);
		color: var(--color-light);
		color: var(--color-text-secondary);
		border-radius: 15px;
		background: #3b4046;
		box-shadow:
			5px 5px 10px #32363c,
			-5px -5px 10px #444a51;
		transition: all 0.2s ease;

		&.selected,
		&:hover,
		&:active,
		&:focus {
			background: rgb(59, 64, 70);
			box-shadow:
			rgb(42, 46, 50) 5.8px 5.8px 17px 0px inset,
			rgb(84, 91, 99) -5.8px -5.8px 17px 0px inset;
		}

		&:hover {
			color: var(--color-light);
		}

		&.selected {
			color: var(--color-accent);
		}
	}
</style>
