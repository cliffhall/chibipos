<script>
	import { slide } from 'svelte/transition';
	import cancelIcon from '$lib/img/icons/cancel.svg'

	let {
		action,
		ready,
		imgSrc,
		imgAlt,
		readyImg,
		readyAlt,
		flexBasis,
		text = '',
		disabled = false,
		goback = false,
		promise = null
	} = $props();

	let errorState = $state(false);

	$effect(() => {
		if (!promise) {
			errorState = false; // Reset if no promise
			return;
		}
		promise
			.then(response => {
				errorState = !response.success; 
			})
			.catch(() => {
				errorState = true;
			});
	});
</script>

<button class="{ready && !goback ? 'ready' : ''} {errorState ? 'error' : ''}" onclick={action} style:--flexBasis={flexBasis} {disabled}>
	{#if promise}
		{#await promise}
			<p in:slide={{ duration: 200 }}
					 >awaiting</p>
		{:then response}
			{#if response.success}
				<p in:slide={{ duration: 200 }}>{response.success}</p>
			{:else}
					<img
					in:slide={{ duration: 200 }}
					out:slide={{ duration: 200 }}
					src={cancelIcon}
					alt=cancelar
					draggable="false"
				/>
			{/if}
		{/await}
	{:else}
		{#if imgSrc}
			{#if ready}
				<img
					in:slide={{ duration: 200 }}
					out:slide={{ duration: 200 }}
					src={readyImg}
					alt={readyAlt}
					draggable="false"
				/>
			{:else}
				<img
					in:slide={{ duration: 200 }}
					out:slide={{ duration: 200 }}
					src={imgSrc}
					alt={imgAlt}
					draggable="false"
				/>
			{/if}
		{:else}
			<p>{text}</p>
		{/if}
	{/if}
</button>



<style lang="scss">
	button {
		position: relative;
		background-color: var(--color-accent);
		border-radius: var(--panel-border);
		font-size: 1.5em;
		font-family: var(--font-titles);
		text-align: center;
		color: var(--color-bg);
		flex-basis: var(--flexBasis);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		height: var(--button-height);
		padding: 0.5em 1em;
		transition: 0.5s ease;

		&:disabled {
			background-color: var(--color-light);
		}

		&.ready {
			background-color: var(--color-ready);
		}

		&.error {
			background-color: red;
		}

		img {
			position: absolute;
			top: 50%;
			left: 0;
			height: calc(100% - 0.75em);
			transform: translateY(-50%);
			width: 100%;
			object-fit: contain;
		}
	}
</style>
