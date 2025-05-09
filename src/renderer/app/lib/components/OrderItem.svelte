<script>
	import plusIcon from '$lib/img/icons/plus.svg';
	import deleteIcon from '$lib/img/icons/delete.svg';
	import { cart } from '../stores/shared.svelte.js';
	import { slide, fly, fade } from 'svelte/transition';

	let { item } = $props();

	function addOne(item) {
		const oldItem = cart.find((existingItem) => existingItem.id === item.id);
		oldItem.quantity++;
	}

	function deleteItem(item) {
		const index = cart.findIndex((thing) => thing.id === item.id);
		if (index !== -1) {
			cart.splice(index, 1); // Mutate the array
		}
	}
</script>

<li class="item" transition:slide>
	<div class="field">
		<button class="circle" onclick={() => addOne(item)}>
			<img src={plusIcon} alt="más" draggable="false" />
		</button>
		{#key item.quantity}
			<p in:fly={{ y: 15 }} class="qty">{item.quantity}</p>
		{/key}
	</div>
	<div class="field">
		<p class="lineitem">{item.name}</p>
	</div>
	<div class="field currency">
		<p>{item.price}</p>
	</div>
	<div class="field currency">
		{#key item.quantity}
			<p in:fly={{ y: 15 }}>{item.price * item.quantity}</p>
		{/key}
	</div>
	<div class="field">
		<button class="circle" onclick={() => deleteItem(item)}>
			<img src={deleteIcon} alt="eliminar" />
		</button>
	</div>
</li>

<style lang="scss">
	.item {
		position: relative;
		display: grid;
		grid-template-columns: auto 6em 1fr 1fr auto;
		gap: 1em;
		padding: 1em 0;
		border-bottom: solid var(--color-accent) 1px;

		&:last-of-type {
			border-bottom: none;
		}

		.field {
			display: flex;
			align-items: center;

			&.currency {
				justify-content: flex-end;
				font-family: var(--font-numbers);
			}

			.qty {
				width: 3em;
				text-align: center;
				font-family: var(--font-numbers);
			}
		}
	}
</style>
