import { p as push, k as escape_html, h as pop, l as getContext } from './index2-CB4_g73u.js';
import { s as stores } from './client-C4EspjzN.js';
import './exports-PRYynYMi.js';

({
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get status() {
    return context().page.status;
  }
};
const page = page$1;
function Error$1($$payload, $$props) {
  push();
  $$payload.out += `<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`;
  pop();
}

export { Error$1 as default };
//# sourceMappingURL=error.svelte-uvw53TZ3.js.map
