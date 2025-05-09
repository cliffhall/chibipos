export async function load() {
  console.log('(tickets/+page.server.js) load function called');
  return {
    initialTickets: [] // Provide an empty array for SSR
  };
}
