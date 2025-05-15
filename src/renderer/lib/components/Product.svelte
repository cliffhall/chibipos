<script>
	import { cart } from '../stores/shared.svelte.js';
	import { fly, fade } from 'svelte/transition';

	let { product } = $props();

	let inCart = $derived(cart.some((item) => item.id === product.id));
	let cartQty = $derived.by(() => {
		const cartItem = cart.find((item) => item.id === product.id);
		return cartItem ? cartItem.quantity : 0;
	});

	function addToCart() {
		if (inCart) {
			const cartItem = cart.find((item) => item.id == product.id);
			cartItem.quantity++;
		} else {
			product.quantity = 1;
			cart.push(product);
		}
	}
</script>

<li class="product" in:fly={{ y: 20, duration: 200 }} out:fade={{ duration: 200 }}>
	<button onclick={addToCart}>
		{#if product.image}
			<img src={`/img/products/${product.image}`} alt={product.name} draggable="false" />
		{:else}
			<p>{product.name}</p>
		{/if}
	</button>
	{#if cartQty}
		<div class="quantity" transition:fly={{ y: 15, duration: 200 }}>
			{#key cartQty}
				<p in:fly={{ y: 15 }}>{cartQty}</p>
			{/key}
		</div>
	{/if}
	<p>{product.name}</p>
</li>

<style lang="scss">
	.product {
		height: max-content;
		position: relative;

		button {
			border-radius: 8px;
			height: 6.25em;
			background-color: var(--color-light);
			width: 100%;
			margin-bottom: 0.5em;
			overflow: hidden;
			padding: 0.5em;

			p {
				color: var(--color-bg);
				font-weight: 700;
			}

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				color: var(--color-bg);
				font-family: var(--font-text);
				font-size: 0.9em;
				font-weight: 600;
			}
		}

		.quantity {
			--size: 2em;
			position: absolute;
			bottom: -0rem;
			right: -0.25em;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: var(--color-accent);
			border-radius: 50%;
			height: var(--circle-size);
			width: var(--circle-size);

			p {
				font-size: 1.125em;
				font-weight: 700;
				color: var(--color-bg);
				text-align: center;
				font-family: var(--font-numbers);
			}
			// padding: 0.5rem;
			// height: var(--circle-size);
		}

		p {
			font-size: 0.8em;
			line-height: 1;
			font-weight: 300;
			color: var(--color-light);
		}
	}
</style>
