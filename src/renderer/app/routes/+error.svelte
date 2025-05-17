<!-- /Users/cliffhall/Projects/chibipos/src/renderer/app/routes/+error.svelte -->
<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    // Optional: Log the error for debugging, but don't display it.
    onMount(() => {
        if ($page.error) {
            console.warn(`[Custom +error.svelte] An error occurred: ${$page.error.message} (Status: ${$page.status}) on URL: ${$page.url.href}`);
        } else {
            console.warn(`[Custom +error.svelte] Page loaded, but no specific error object in $page.error. Status: ${$page.status}, URL: ${$page.url.href}`);
        }
    });
</script>

<!-- Intentionally empty to show nothing -->
<div style="width: 100%; height: 100%; background-color: transparent;">
    <!-- Or match your app's main background if transparency causes issues -->
    <!-- <div style="width: 100%; height: 100%; background-color: var(--color-dark-bg);"></div> -->
</div>

<style>
    /* You could ensure it takes up no visual space or is transparent */
    div {
        /* position: fixed; top: 0; left: 0; z-index: -1; */ /* Example to hide it */
    }
</style>
