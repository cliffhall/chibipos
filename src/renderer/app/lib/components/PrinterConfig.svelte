<script>
  import ActionButton from './ActionButton.svelte';
  import saveIcon from '$lib/img/icons/save.svg'
	import confirmIcon from '$lib/img/icons/confirm.svg';
  import {printerConfig } from '$lib/stores/shared.svelte.js'
	import { fly } from 'svelte/transition';


  let printerIP = $state()
  let ipReady = $state(false)

  function changeIP() {
    if(!ipReady) {
      ipReady = true
      return
    } else {
      printerConfig.ip = printerIP
      ipReady = false
    }
  }
</script>


<div class="printerConfig" transition:fly={{y: 30, duration: 500}}>
  <div class="panel">
    <p class="title">IP impresora</p>

    <div class="buttonRow">
      <input type="text" bind:value={printerIP} placeholder={printerConfig.ip}>
      <ActionButton
      imgSrc={saveIcon}
      imgAlt='guardar'
      readyImg={confirmIcon}
      readyAlt='confirmar'
      bind:ready={ipReady}
      action={changeIP}
      />
    </div>
  </div>

</div>

<style lang="scss">
  .printerConfig {
    position: absolute;
    top: 40%;
    left: 50%;
    height: 200px;
    width: 300px;
    transform: translate(-50%, -50%);

    .panel {
      background: linear-gradient(var(--color-panel1), var(--color-panel2));
      border-radius: var(--panel-border);
      min-height: 200px;
      padding: 1em 1em;
    }

    input {
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
		}

    .buttonRow {
      display: flex;
      gap: 1em;
    }
  }
</style>
