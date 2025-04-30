async function load({ fetch }) {
  try {
    const ticketRequest = await fetch(`/api/ticket?date=${/* @__PURE__ */ new Date()}`);
    const tickets = await ticketRequest.json();
    return { tickets };
  } catch (error) {
    console.error("No tickets", error);
  }
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-yrbBlK4Z.js')).default;
const server_id = "src/routes/tickets/+page.server.js";
const imports = ["_app/immutable/nodes/4.9GacC_Dp.js","_app/immutable/chunks/cdZpXTRU.js","_app/immutable/chunks/CpheGI1x.js","_app/immutable/chunks/lS090TL_.js","_app/immutable/chunks/CLlfmT2c.js","_app/immutable/chunks/B8U8OScr.js","_app/immutable/chunks/DmQUckAG.js","_app/immutable/chunks/iHDSuM_z.js"];
const stylesheets = ["_app/immutable/assets/ActionButton.CNteP_Ht.css","_app/immutable/assets/4.DtsLywWI.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=4-o-dyHsCH.js.map
