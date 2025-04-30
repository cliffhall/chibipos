import { p as push, n as attr_class, t as attr, y as attr_style, z as await_block, k as escape_html, h as pop, v as stringify } from './index2-CB4_g73u.js';

/* empty css                                           */
const cancelIcon = "data:image/svg+xml,%3csvg%20width='8'%20height='8'%20viewBox='0%200%208%208'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M4%200C1.8%200%200%201.8%200%204C0%206.2%201.8%208%204%208C6.2%208%208%206.2%208%204C8%201.8%206.2%200%204%200ZM4%201C4.66%201%205.26%201.21%205.75%201.56L1.56%205.75C1.21%205.26%201%204.66%201%204C1%202.34%202.34%201%204%201ZM6.44%202.25C6.79%202.74%207%203.34%207%204C7%205.66%205.66%207%204%207C3.34%207%202.74%206.79%202.25%206.44L6.44%202.25Z'%20fill='%23191D22'/%3e%3c/svg%3e";
function ActionButton($$payload, $$props) {
  push();
  let {
    action,
    ready,
    imgSrc,
    imgAlt,
    readyImg,
    readyAlt,
    flexBasis,
    text = "",
    disabled = false,
    goback = false,
    promise = null
  } = $$props;
  $$payload.out += `<button${attr_class(`${stringify(ready && !goback ? "ready" : "")} ${stringify("")}`, "svelte-13fz5bq")}${attr("disabled", disabled, true)}${attr_style("", { "--flexBasis": flexBasis })}>`;
  if (promise) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<!---->`;
    await_block(
      promise,
      () => {
        $$payload.out += `<p>awaiting</p>`;
      },
      (response) => {
        if (response.success) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<p>${escape_html(response.success)}</p>`;
        } else {
          $$payload.out += "<!--[!-->";
          $$payload.out += `<img${attr("src", cancelIcon)} alt="cancelar" draggable="false" class="svelte-13fz5bq">`;
        }
        $$payload.out += `<!--]-->`;
      }
    );
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    if (imgSrc) {
      $$payload.out += "<!--[-->";
      if (ready) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<img${attr("src", readyImg)}${attr("alt", readyAlt)} draggable="false" class="svelte-13fz5bq">`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<img${attr("src", imgSrc)}${attr("alt", imgAlt)} draggable="false" class="svelte-13fz5bq">`;
      }
      $$payload.out += `<!--]-->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<p>${escape_html(text)}</p>`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></button>`;
  pop();
}

export { ActionButton as A };
//# sourceMappingURL=ActionButton-D-bIh0W6.js.map
