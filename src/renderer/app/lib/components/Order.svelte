<script>
	// Utils
	import { slide, fly, fade } from 'svelte/transition';
	import { commitSale } from '$lib/scripts/sale.js';
	// Components
	import confirmIcon from '$lib/img/icons/confirm.svg';
	import returnIcon from '$lib/img/icons/return.svg';
	import resetIcon from '$lib/img/icons/reset.svg';
	import cardIcon from '$lib/img/icons/card.svg';
	import cashIcon from '$lib/img/icons/cash.svg';
	import Cash from '$lib/components/Cash.svelte';
	import OrderItem from '$lib/components/OrderItem.svelte';
	import ActionButton from './ActionButton.svelte';
	// Data
	import { cart } from '$lib/stores/shared.svelte.js';

	let subtotal = $derived(
		cart.reduce((acc, item) => {
			const price = parseFloat(item.price);
			const quantity = parseFloat(item.quantity);
			return acc + price * quantity;
		}, 0)
	);

	let discounted = $state(false);
	let discountInput = $state(0);
	let discountRate = $derived(discountInput / 100);
	let discountAmount = $derived(Math.round(subtotal * discountRate * 100) / 100);

	let total = $derived(subtotal - discountAmount);

	let readyForCardPayment = $state(false);
	let readyForCashPayment = $state(false);

	function reset() {
		readyForCashPayment = false;
		readyForCardPayment = false;
		discounted = false;
		discountInput = 0;
		cart.length = 0;
	}

	function handleDiscount() {
		if (discounted) {
			discountInput = 0;
			discounted = false;
		} else {
			discounted = true;
		}
	}

	function formatDiscount(e) {
		const number = Number(discountInput);
		const clamped = Math.max(0, Math.min(100, Math.floor(number)));
		discountInput = clamped;
		e.target.value = discountInput;
	}

	function handleCashBtn() {
		if (readyForCardPayment) {
			readyForCardPayment = false;
			return;
		}
		if (!readyForCashPayment) {
			readyForCashPayment = true;
		} else {
			readyForCashPayment = false;
		}
	}

	async function handleCardBtn() {
		if (readyForCashPayment) {
			readyForCashPayment = false;
			return;
		}
		if (!readyForCardPayment) {
			readyForCardPayment = true;
		} else {
			const cardSale = await commitSale(cart, total, 0, total, discountRate, 0, 0);
			if (cardSale.status == 200) {
				reset();
			}
		}
	}
</script>

<div class="order">
	<div class="panel">
		<div class="panel--header">
			<p>cantidad</p>
			<p>producto</p>
			<p>precio</p>
			<p>importe</p>
		</div>

		<div class="panel--body {cart.length < 1 ? 'empty' : ''}">
			{#if cart.length > 0}
				<div class="container" transition:fade={{ duration: 200 }}>
					{#if readyForCashPayment}
						<Cash {total} bind:ready={readyForCashPayment} {discountRate} {reset} />
					{/if}
					<button class="circle reset" onclick={reset}>
						<img src={resetIcon} alt="Borrar" />
					</button>
					<ul class={['order--items', { discounted }]} in:slide out:fade>
						{#each cart as item (item.id)}
							<OrderItem {item} />
						{/each}
					</ul>
					<footer>
						{#if discounted}
							<div class="discount">
								<div class="discount--row">
									<p class="discount--label">subtotal</p>
									<p class="discount--amount">{subtotal}</p>
								</div>
								<div class="discount--row">
									<p class="discount--label">descuento</p>
									<div class="discount--input">
										<input
											bind:value={discountInput}
											type="number"
											min="0"
											max="100"
											oninput={formatDiscount}
										/>
										<p class="discount--input__sign">%</p>
									</div>
									<p class="discount--amount">
										{discountAmount % 1 !== 0 ? discountAmount.toFixed(2) : discountAmount}
									</p>
								</div>
							</div>
						{/if}
						<div class="summary">
							<p class="summary--label">Total</p>
							<p class="summary--amount">{total % 1 !== 0 ? total.toFixed(2) : total}</p>
						</div>

						<div class="buttonRow">
							<ActionButton
							readyImg={returnIcon}
							readyAlt='cancelar'
							imgSrc={cashIcon}
							imgAlt='efectivo'
							flexBasis='50%'
							bind:ready={readyForCashPayment}
							action={handleCashBtn}
							goback=true
							/>
							<ActionButton
							readyImg={confirmIcon}
							readyAlt='confirmar'
							imgSrc={cardIcon}
							imgAlt='tarjeta'
							flexBasis='50%'
							bind:ready={readyForCardPayment}
							action={handleCardBtn}
							/>
							<ActionButton
							flexBasis='15%'
							action={handleDiscount}
							text='%'
							ready={discounted}
							/>
						</div>

					</footer>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.order {
		background-color: var(--color-bg);
		padding: var(--panel-padding);
		padding: 2em var(--panel-padding);
		height: 100%;
	}

	.panel {
		height: 100%;
		max-height: 100%;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1.5em 1fr;

		&--header {
			display: grid;
			grid-template-columns: 6em 6em 1fr 1fr 3em;
			gap: 0.5rem;
			padding: 0 1rem;
			color: var(--color-text-secondary);
			font-weight: 300;
			font-size: 0.8em;

			p {
				text-align: right;

				&:first-of-type {
					text-align: center;
				}
			}
		}

		&--body {
			position: relative;
			padding: 1em;
			background: linear-gradient(var(--color-panel1), var(--color-panel2));
			height: 100%;
			border-radius: var(--panel-border);
			transition: 0.3s ease;

			&.empty {
				opacity: 0.1;
			}

			.container {
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}

			.reset {
				position: absolute;
				top: -1em;
				right: -1em;
			}
		}
	}

	.order--items {
		max-height: 440px;
		position: relative;
		padding-right: 4px;
		overflow-y: scroll;

		&.discounted {
			max-height: 358px;
		}

		&::-webkit-scrollbar {
			width: 0.5em;
		}

		&::-webkit-scrollbar-track {
			background: linear-gradient(var(--color-panel1), var(--color-panel2));
			width: 1em;
			border-radius: 50px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: var(--color-thead);
			width: 0.5em;
			border-radius: 50px;
		}
	}

	footer {
		.discount {
			padding-top: 1em;

			&--row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 1em;
			}

			&--label {
				color: var(--color-text-secondary);
			}

			&--input {
				display: flex;
				gap: 0.5em;

				input[type='number'] {
					-moz-appearance: textfield; /* Firefox */
					appearance: textfield;
					color: var(--color-text);
					font-family: var(--font-numbers);
					font-size: 1em;
					width: 5em;
					padding: 0.25rem 1rem;
					border-radius: 50px;
					background-color: #383c42;
					text-align: right;
					box-shadow:
						1px 1px 2px rgba(90, 96, 106, 0.3),
						-1px -1px 2px rgba(22, 24, 26, 0.5),
						inset -1px 1px 2px rgba(22, 24, 26, 0.2),
						inset 1px -1px 2px rgba(22, 24, 26, 0.2),
						inset -1px -1px 2px rgba(90, 96, 106, 0.9),
						inset 1px 1px 3px rgba(22, 24, 26, 0.9);

					&::-webkit-inner-spin-button,
					&::-webkit-outer-spin-button {
						-webkit-appearance: none;
						margin: 0;
					}
				}

				&__sign {
					color: var(--color-accent);
					font-family: var(--font-titles);
					font-size: 2em;
				}
			}

			&--amount {
				padding: 0.25rem 1rem;
				width: 6em;
				border-radius: 50px;
				border: solid rgb(96, 96, 96) 1px;
				text-align: right;
				font-family: var(--font-numbers);
			}
		}

		.summary {
			display: flex;
			justify-content: space-between;
			font-size: 2em;
			padding: 1rem 0;

			&--label {
				color: var(--color-text-secondary);
			}

			&--amount {
				font-weight: 700;
				font-family: var(--font-numbers);
			}
		}

		.buttonRow {
			display: flex;
			justify-content: space-between;
			gap: 1em;


		}
	}
</style>
