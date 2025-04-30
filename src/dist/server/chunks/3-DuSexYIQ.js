import './index-BIAFQWR9.js';

async function load({ fetch }) {
  try {
    const salesRequest = await fetch(`/api/sale/month?date=${/* @__PURE__ */ new Date()}`);
    const dailySales = await salesRequest.json();
    const sales = dailySales.sales;
    return { sales };
  } catch (error) {
    console.error("No sales");
  }
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-8m8qEhUW.js')).default;
const server_id = "src/routes/reportes/+page.server.js";
const imports = ["_app/immutable/nodes/3.CvKAspic.js","_app/immutable/chunks/cdZpXTRU.js","_app/immutable/chunks/CpheGI1x.js","_app/immutable/chunks/lS090TL_.js","_app/immutable/chunks/B8U8OScr.js","_app/immutable/chunks/DmQUckAG.js","_app/immutable/chunks/Ej25J0qn.js"];
const stylesheets = ["_app/immutable/assets/ActionButton.CNteP_Ht.css","_app/immutable/assets/3.dVwUNe_d.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=3-DuSexYIQ.js.map
