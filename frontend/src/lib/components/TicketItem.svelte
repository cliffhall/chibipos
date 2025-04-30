<script>
	let { ticketItem } = $props();
	const { product, quantity, price } = ticketItem;
	let extPrice = quantity * price;
</script>

<li class="item">
	<div class="field currency">
		<p class="lineitem">{quantity}</p>
	</div>
	<div class="field">
		<p class="lineitem">{product.name}</p>
	</div>
	<div class="field currency">
		<p class="lineitem">{price}</p>
	</div>
	<div class="field currency">
		<p class="lineitem">{extPrice}</p>
	</div>
</li>

<style lang="scss">
	.item {
		display: flex;
		justify-content: space-between;
		gap: 1em;
		padding: 1em 0;
		border-bottom: solid var(--color-accent) 1px;

		&:last-of-type {
			border-bottom: none;
		}

		.field {
			display: flex;
			align-items: center;
			flex-basis: 20%;
			// border: solid green thin;

			&:first-of-type {
				flex-basis: 10%;
			}

			&:nth-of-type(2) {
				flex-basis: 70%;
				margin-left: 1em;
			}

			&.currency {
				justify-content: flex-end;
				font-family: var(--font-numbers);
			}
		}
	}
</style>
