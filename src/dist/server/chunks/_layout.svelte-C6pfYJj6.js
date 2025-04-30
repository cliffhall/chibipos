import { p as push, j as head, h as pop } from './index2-CB4_g73u.js';
import './client-C4EspjzN.js';
import './exports-PRYynYMi.js';

/* empty css                                                      */
function Nav($$payload, $$props) {
  push();
  $$payload.out += `<nav class="svelte-7pmp0g"><ul class="links svelte-7pmp0g"><a href="/" class="svelte-7pmp0g">Venta</a> <a href="/tickets" class="svelte-7pmp0g">Tickets</a> <a href="/reportes" class="svelte-7pmp0g">Reportes</a></ul> <ul class="buttons svelte-7pmp0g"><button class="svelte-7pmp0g">actualizar reportes</button> <button class="svelte-7pmp0g">IP impresora</button></ul></nav>`;
  pop();
}
function _layout($$payload, $$props) {
  push();
  let { children } = $$props;
  head($$payload, ($$payload2) => {
    $$payload2.out += `<link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""> <link href="https://fonts.googleapis.com/css2?family=Bakbak+One&amp;family=Roboto+Mono:ital,wght@0,100..700;1,100..700&amp;family=Roboto:ital,wght@0,100..900;1,100..900&amp;display=swap" rel="stylesheet">`;
  });
  $$payload.out += `<main class="svelte-1udgiz">`;
  children($$payload);
  $$payload.out += `<!----></main> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  Nav($$payload);
  $$payload.out += `<!---->`;
  pop();
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-C6pfYJj6.js.map
