
export const prerender = false;

export async function load({ fetch }) {
  try {
    const salesRequest = await fetch(`/api/sale/month?date=${new Date()}`);
    if (!salesRequest.ok) {
      // Log the actual error status and message for better debugging
      const errorText = await salesRequest.text();
      console.error(`Failed to fetch sales data: ${salesRequest.status} ${salesRequest.statusText}`, errorText);
      return { sales: [], error: `Failed to load sales data. Status: ${salesRequest.status}` };
    }
    const dailySales = await salesRequest.json();
    // It's good to ensure dailySales and dailySales.sales exist before accessing
    const sales = dailySales?.sales || [];
    return { sales };
  } catch (error) {
    console.error('Error loading sales data in /reportes/+page.server.js:', error); // Log the actual error object
    return { sales: [], error: 'An unexpected error occurred while loading sales data.' };
  }
}
