// *************************************
// LAYOUT
// *************************************

// src/renderer/app/routes/+layout.server.js
export async function load() {
  console.log('(+layout.server.js) load function called', new Date().toISOString());
  // Provide initial empty structures for data that will be fetched client-side
  // This ensures they are defined during SSR.
  return {
    initialCats: [],
    initialProducts: []
  };
}
