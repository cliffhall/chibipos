<script>
	import { slide, fly, fade, blur } from 'svelte/transition';
	import { commitSale } from '$lib/scripts/sale.js';

	// Components
	import confirmIcon from '$lib/img/icons/confirm.svg';
	import bill50 from '$lib/img/bill-50.jpg';
	import bill100 from '$lib/img/bill-100.jpg';
	import bill200 from '$lib/img/bill-200.jpg';
	import bill500 from '$lib/img/bill-500.jpg';
	import { cart } from '../stores/shared.svelte.js';
	// Data
	let { total, ready = $bindable(), discountRate, reset } = $props();
	let cash = $state(0);
	let card = $state(0);
	let received = $derived(cash + card);
	let pending = $derived(total > received ? total - received : 0);
	let change = $derived(received - total < 0 ? 0 : received - total);

	function numpadPress(key) {
		cash = cash.toString();
		cash += key;
		cash = parseFloat(cash);
	}

	function deleteAmounts() {
		cash = 0
		card = 0
	}

	function formatInput(e, value) {
		const number = Number(value)
		e.target.value = number
	}

	async function processPayment() {
		if (received < total) {
			return;
		} else {
			let actualCash = cash
			let actualCard = card
			let actualChange = 0

			if(cash > 0 && received >= total) {
				actualChange = change

				if(card > 0) {
					actualCard = total - (cash - actualChange)
				}
			} else if (cash > 0 && received < total) {
				throw new Error('Insufficient payment')
			}

			const payment = await commitSale(cart, total, actualCash - actualChange, actualCard, discountRate, actualChange, actualCash);
			if (payment.status == 200) {
				ready = false;
				cart.length = 0;
				reset()
			} else {
				throw new Error('failed to commit sale')
			}
		}
	}

	function billPayment(value) {
		cash = value;
		processPayment();
	}
</script>

{#snippet numkey(number)}
	<button onclick={() => numpadPress(number)}>{number}</button>
{/snippet}

{#snippet bill(value, src)}
	<button class="bill" disabled={value < total} onclick={() => billPayment(value)}>
		<img {src} alt="billete de {value}" />
	</button>
{/snippet}

<div class="cash" transition:fly={{ y: 50, duration: 300 }}>
	<div class="cash--header">
		<div class="row">
			<div class="field">
				<p class="label">tarjeta</p>
				<input bind:value={card} type="number" name="tarjeta" oninput={(e) => {formatInput(e, card)}} />
			</div>
			<div class="field">
				<p class="label">efectivo</p>
				<input bind:value={cash} type="number" name="efectivo" oninput={(e) => {formatInput(e, cash)}}/>
			</div>
		</div>
		<div class="row">
			<p class="label">total</p>
			<p class="amount">{total % 1 !== 0 ? total.toFixed(2) : total}</p>
		</div>
		<div class="row">
			<p class="label">pendiente</p>
			<p class="amount {pending > 0 ? 'accent' : ''}">{pending % 1 !== 0 ? pending.toFixed(2) : pending}</p>
		</div>
		<div class="row">
			<p class="label">cambio</p>
			<p class="amount change {change > 0 ? 'accent' : ''}">{change % 1 !== 0 ? change.toFixed(2) : change}</p>
		</div>
	</div>
	<div class="cash--body">
		<div class="bills">
			{@render bill(50, bill50)}
			{@render bill(100, bill100)}
			{@render bill(200, bill200)}
			{@render bill(500, bill500)}
		</div>
		<div class="numpad">
			{@render numkey('7')}
			{@render numkey('8')}
			{@render numkey('9')}
			{@render numkey('4')}
			{@render numkey('5')}
			{@render numkey('6')}
			{@render numkey('1')}
			{@render numkey('2')}
			{@render numkey('3')}
			{@render numkey('0')}
			<button class="double" onclick={deleteAmounts}>borrar</button>
		</div>
	</div>
	<div class="cash--footer">
		<button class="confirmBtn" disabled={pending > 0} onclick={processPayment}>
			<img src={confirmIcon} alt="confirmar" />
		</button>
	</div>
</div>

<style lang="scss">
	.cash {
		position: absolute;
		left: calc(-100% - 2em);
		top: 0em;
		height: calc(100% - 0em);
		width: 400px;
		width: 100%;
		background: linear-gradient(var(--color-panel1), var(--color-panel2));
		border-radius: var(--panel-border);
		padding: var(--panel-padding);
		padding-bottom: 1em;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		&--header {
			.row {
				font-size: 1.5em;
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 0.75rem;
				gap: 2em;
			}

			.label {
				color: var(--color-text-secondary);
				font-weight: 300;
				flex-basis: 50%;
				font-size: 1.25rem;
			}

			.amount {
				padding: 0.25rem 1rem;
				flex-basis: 50%;
				border-radius: 50px;
				border: solid rgb(96, 96, 96) 1px;
				text-align: right;
				font-family: var(--font-numbers);
				&.accent {
					color: var(--color-accent);
				}

				&.change {
					border: solid white 1px;
					border: none;
					font-weight: 700;
				}
			}

			.field {
				.label {
					font-size: 1rem;
					margin-bottom: 0.5rem;
				}
			}

			input[type='number'] {
				-moz-appearance: textfield; /* Firefox */
				appearance: textfield;
				color: var(--color-text);
				font-family: var(--font-numbers);
				font-size: 1em;
				width: 100%;
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
		}

		&--body {
			display: flex;
			gap: 2em;
			justify-content: space-between;

			.bills {
				.bill {
					height: 4em;
					margin-bottom: 1em;

					&:last-of-type {
						margin-bottom: 0;
					}

					&:disabled {
						position: relative;
						// border: solid red;

						&::before {
							content: '';
							position: absolute;
							top: 0;
							left: 0;
							height: 100%;
							width: 100%;
							background-color: var(--color-darker);
							opacity: 0.8;
						}
					}

					img {
						height: 100%;
						object-fit: contain;
					}
				}
			}

			.numpad {
				display: grid;
				width: fit-content;
				grid-template-columns: repeat(3, 1fr);
				column-gap: 1rem;
				row-gap: 1rem;
				height: fit-content;

				button {
					font-family: var(--font-titles);
					font-size: 1.25em;
					color: var(--color-accent);
					height: var(--button-height);
					width: var(--button-height);
					border-radius: var(--panel-border);
					background: #3b4046;
					box-shadow:
						5px 5px 10px #32363c,
						-5px -5px 10px #444a51;
					transition: all 0.2s ease;

					&.double {
						width: calc(var(--button-height) * 2 + 1em);
						grid-column: span 2;
					}
				}
			}
		}

		&--footer {
			display: flex;
			justify-content: flex-end;

			.confirmBtn {
				display: block;
				width: 150px;
				// width: calc(var(--button-height) * 2 + 2em);
				border-radius: var(--panel-border);
				height: var(--button-height);
				background-color: var(--color-ready);
				padding: 0.5em 1em;
				transition: 0.5s ease;

				&:disabled {
					background-color: var(--color-light);
				}

				img {
					height: 100%;
					width: 100%;
					object-fit: contain;
				}
			}
		}
	}
</style>
