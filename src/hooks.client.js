// /Users/cliffhall/Projects/chibipos/src/hooks.client.js
import { goto } from '$app/navigation';

let initialLoadRecoveryAttempted = false;

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event }) {
    const errorDetails = {
        message: error?.message,
        status: error?.status,
        name: error?.name,
    };
    const eventDetails = {
        // Log event.url as is, to see its type if it's not a string
        url: event?.url,
        routeId: event?.route?.id,
        params: event?.params,
    };

    // Use try-catch for JSON.stringify as event.url might be a URL object
    try {
        console.log('[hooks.client.js handleError] Error caught (DETAILS):', JSON.parse(JSON.stringify(errorDetails)));
        console.log('[hooks.client.js handleError] Event (DETAILS - raw event.url might be an object):', JSON.parse(JSON.stringify(eventDetails)));
    } catch (e) {
        console.error('[hooks.client.js handleError] Error stringifying details for logging:', e);
        console.log('[hooks.client.js handleError] Error caught (DETAILS - raw):', errorDetails);
        console.log('[hooks.client.js handleError] Event (DETAILS - raw):', eventDetails);
    }


    let eventUrlPathname = ''; // Initialize
    console.log(`[hooks.client.js handleError] DIAGNOSTIC: Initial eventUrlPathname: "${eventUrlPathname}"`);

    if (event && event.url) {
        if (typeof event.url === 'string') {
            console.log(`[hooks.client.js handleError] DIAGNOSTIC: event.url is a STRING. Value: "${event.url}"`);
            try {
                const parsedUrl = new URL(event.url);
                eventUrlPathname = parsedUrl.pathname;
                console.log(`[hooks.client.js handleError] DIAGNOSTIC: Successfully parsed STRING event.url.pathname: "${eventUrlPathname}"`);
            } catch (e) {
                console.error('[hooks.client.js handleError] DIAGNOSTIC: CRITICAL - Could not parse STRING event.url.', {
                    url: event.url,
                    errorMessage: e.message,
                    errorName: e.name
                });
            }
        } else if (typeof event.url === 'object' && event.url !== null && typeof event.url.pathname === 'string') {
            // It's likely a URL object already
            console.log(`[hooks.client.js handleError] DIAGNOSTIC: event.url is an OBJECT with a pathname. Value:`, event.url);
            eventUrlPathname = event.url.pathname;
            console.log(`[hooks.client.js handleError] DIAGNOSTIC: Used event.url.pathname directly: "${eventUrlPathname}"`);
        } else {
            console.warn(`[hooks.client.js handleError] DIAGNOSTIC: event.url is neither a string nor a recognized URL object. Value:`, event.url);
        }
    } else {
        console.warn(`[hooks.client.js handleError] DIAGNOSTIC: SKIPPING URL processing - event or event.url is missing. Details:`, {
            eventExists: !!event,
            eventUrlExists: !!event?.url,
            eventUrlValue: event?.url
        });
    }

    console.log(`[hooks.client.js handleError] DIAGNOSTIC: Final eventUrlPathname before isPathMatch check: "${eventUrlPathname}"`);

    const isFileProtocol = window.location.protocol === 'file:';
    const isErrorEligible = error && (error.status === 404 || (error.message && error.message.includes('Not found')));
    const isPathMatch = typeof eventUrlPathname === 'string' && eventUrlPathname.endsWith('/index.html');

    console.log(`[hooks.client.js handleError] Recovery Check:
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
        initialLoadRecoveryAttempted = true;
        console.warn('[hooks.client.js handleError] Initial load resulted in "Not Found" for index.html. Attempting recovery to root (/).');
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            await goto('/', { replaceState: true });
            console.log('[hooks.client.js handleError] Recovery goto("/") attempted successfully.');
            return {
                message: 'Recovered from initial load error by navigating to root.'
            };
        } catch (gotoError) {
            console.error('[hooks.client.js handleError] Error during recovery goto("/"):', gotoError);
        }
    }

    console.log('[hooks.client.js handleError] Proceeding with default error handling or error not eligible for recovery (conditions not fully met).');
    return {
        message: error?.message || 'An unexpected error occurred on the client'
    };
}
