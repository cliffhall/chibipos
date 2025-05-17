import {goto} from "$app/navigation";

let initialLoadRecoveryAttempted = false;
let handleErrorCallCount = 0;

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event }) {
    handleErrorCallCount++;
    console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] initialLoadRecoveryAttempted (at start): ${initialLoadRecoveryAttempted}`);

    const errorDetails = {
        message: error?.message,
        status: error?.status,
        name: error?.name,
    };
    const eventDetails = {
        url: event?.url,
        routeId: event?.route?.id,
        params: event?.params,
    };

    try {
        console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Error caught (DETAILS):`, JSON.parse(JSON.stringify(errorDetails)));
        console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Event (DETAILS - raw event.url might be an object):`, JSON.parse(JSON.stringify(eventDetails)));
    } catch (e) {
        console.error(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Error stringifying details for logging:`, e);
        console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Error caught (DETAILS - raw):`, errorDetails);
        console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Event (DETAILS - raw):`, eventDetails);
    }

    let eventUrlPathname = '';
    console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: Initial eventUrlPathname: "${eventUrlPathname}"`);

    if (event && event.url) {
        if (typeof event.url === 'string') {
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: event.url is a STRING. Value: "${event.url}"`);
            try {
                const parsedUrl = new URL(event.url);
                eventUrlPathname = parsedUrl.pathname;
                console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: Successfully parsed STRING event.url.pathname: "${eventUrlPathname}"`);
            } catch (e) {
                console.error(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: CRITICAL - Could not parse STRING event.url.`, {
                    url: event.url,
                    errorMessage: e.message,
                    errorName: e.name
                });
            }
        } else if (typeof event.url === 'object' && event.url !== null && typeof event.url.pathname === 'string') {
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: event.url is an OBJECT with a pathname. Value:`, event.url);
            eventUrlPathname = event.url.pathname;
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: Used event.url.pathname directly: "${eventUrlPathname}"`);
        } else {
            console.warn(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: event.url is neither a string nor a recognized URL object. Value:`, event.url);
        }
    } else {
        console.warn(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: SKIPPING URL processing - event or event.url is missing. Details:`, {
            eventExists: !!event,
            eventUrlExists: !!event?.url,
            eventUrlValue: event?.url
        });
    }

    console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] DIAGNOSTIC: Final eventUrlPathname before isPathMatch check: "${eventUrlPathname}"`);

    const isFileProtocol = window.location.protocol === 'file:';
    const isErrorEligible = error && (error.status === 404 || (error.message && error.message.includes('Not found')));
    const isPathMatch = typeof eventUrlPathname === 'string' && eventUrlPathname.endsWith('/index.html');

    console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Recovery Check:
        isFileProtocol: ${isFileProtocol},
        !initialLoadRecoveryAttempted: ${!initialLoadRecoveryAttempted},
        errorExists: ${!!error},
        isErrorEligible (404 or "Not found"): ${isErrorEligible},
        isPathMatch (ends with /index.html): ${isPathMatch} (based on eventUrlPathname: "${eventUrlPathname}")`);

    if (
        isFileProtocol &&
        !initialLoadRecoveryAttempted &&
        error &&
        isErrorEligible &&
        isPathMatch
    ) {
        console.warn(`[hooks.client.js handleError CALL #${handleErrorCallCount}] ENTERING RECOVERY BLOCK. initialLoadRecoveryAttempted (before set): ${initialLoadRecoveryAttempted}`);
        initialLoadRecoveryAttempted = true;
        console.warn(`[hooks.client.js handleError CALL #${handleErrorCallCount}] initialLoadRecoveryAttempted (after set): ${initialLoadRecoveryAttempted}. Attempting recovery to root (/).`);

        try {
            window.location.hash = '/';
            setTimeout(async () => await goto('/'), 600);
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Recovery goto("/") attempted successfully.`);
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] window.location.href IMMEDIATELY AFTER goto('/'): ${window.location.href}`);
            return;
        } catch (gotoError) {
            console.error(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Error during recovery goto("/"):`, gotoError);
            return { message: `Recovery navigation failed: ${gotoError.message}`, status: 500 };
        }
    } else {
        // Log why recovery was skipped
        if (initialLoadRecoveryAttempted) {
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Proceeding with default error handling: Recovery already attempted.`);
        } else {
            console.log(`[hooks.client.js handleError CALL #${handleErrorCallCount}] Proceeding with default error handling: Conditions not met for recovery.`);
        }
    }

    return {
        message: error?.message || 'An unexpected error occurred on the client'
    };
}
