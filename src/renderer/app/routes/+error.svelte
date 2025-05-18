<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    onMount(() => {
        if ($page.error) {
            console.warn(`[Custom +error.svelte] An error occurred: ${$page.error.message} (Status: ${$page.status}) on URL: ${$page.url.href}`);
        } else {
            console.warn(`[Custom +error.svelte] Page loaded, but no specific error object in $page.error. Status: ${$page.status}, URL: ${$page.url.href}`);
        }
    });
</script>

<!-- Intentionally empty -->
<div style="width: 100%; height: 100%; background-color: transparent;"></div>
