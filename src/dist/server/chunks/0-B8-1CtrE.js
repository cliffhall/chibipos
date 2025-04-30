async function load({ fetch }) {
  await import('./sync-RGavUnkd.js');
  console.log("load layout", (/* @__PURE__ */ new Date()).toISOString());
  const catRequest = await fetch("/api/catProduct");
  const productRequest = await fetch("/api/product");
  const cats = await catRequest.json();
  const products = await productRequest.json();
  return { cats, products };
}

var _layout_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-C6pfYJj6.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.lMvyTNzw.js","_app/immutable/chunks/cdZpXTRU.js","_app/immutable/chunks/CpheGI1x.js","_app/immutable/chunks/lS090TL_.js","_app/immutable/chunks/BUGfvDXI.js","_app/immutable/chunks/DmQUckAG.js","_app/immutable/chunks/Cw3-Dsd9.js","_app/immutable/chunks/iHDSuM_z.js","_app/immutable/chunks/CTyi8ruM.js","_app/immutable/chunks/Ej25J0qn.js"];
const stylesheets = ["_app/immutable/assets/ActionButton.CNteP_Ht.css","_app/immutable/assets/0.cnArW4mB.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-B8-1CtrE.js.map
