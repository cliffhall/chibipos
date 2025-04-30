import { p as push, h as pop, m as ensure_array_like, n as attr_class, k as escape_html, o as copy_payload, q as assign_payload, t as attr, u as clsx, v as stringify, w as bind_props } from './index2-CB4_g73u.js';
import { s as selectedCat, c as cart, p as printerConfig } from './shared.svelte-6ln_Ry7j.js';
import './client-C4EspjzN.js';
import { c as confirmIcon } from './confirm-DxxL-lrh.js';
import { A as ActionButton } from './ActionButton-D-bIh0W6.js';
import './exports-PRYynYMi.js';

function CatMenu($$payload, $$props) {
  push();
  let { cats } = $$props;
  const each_array = ensure_array_like(cats);
  $$payload.out += `<div class="catmenu svelte-jvj0dt"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let cat = each_array[$$index];
    $$payload.out += `<button${attr_class(selectedCat.cat === cat.id ? "selected" : "", "svelte-jvj0dt")}>${escape_html(cat.name)}</button>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function Product($$payload, $$props) {
  push();
  let { product } = $$props;
  cart.some((item) => item.id === product.id);
  let cartQty = (() => {
    const cartItem = cart.find((item) => item.id === product.id);
    return cartItem ? cartItem.quantity : 0;
  })();
  $$payload.out += `<li class="product svelte-1cutuai"><button class="svelte-1cutuai">`;
  if (product.image) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<img${attr("src", `/img/products/${product.image}`)}${attr("alt", product.name)} draggable="false" class="svelte-1cutuai">`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<p class="svelte-1cutuai">${escape_html(product.name)}</p>`;
  }
  $$payload.out += `<!--]--></button> `;
  if (cartQty) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="quantity svelte-1cutuai"><!---->`;
    {
      $$payload.out += `<p class="svelte-1cutuai">${escape_html(cartQty)}</p>`;
    }
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <p class="svelte-1cutuai">${escape_html(product.name)}</p></li>`;
  pop();
}
function Display($$payload, $$props) {
  let { filteredProducts } = $$props;
  const each_array = ensure_array_like(filteredProducts);
  $$payload.out += `<ul class="display svelte-1i7bwhu"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let product = each_array[$$index];
    Product($$payload, { product });
  }
  $$payload.out += `<!--]--></ul>`;
}
async function commitSale(cart2, total, cash, card, discountRate, change, actualCash) {
  if (!Array.isArray(cart2)) {
    throw new Error("Invalid cart: must be an array");
  }
  if (isNaN(total) || isNaN(cash) || isNaN(card) || isNaN(discountRate)) {
    throw new Error("All monetary values must be valid numbers");
  }
  const saleData = {
    cash: parseFloat(cash),
    card: parseFloat(card),
    cashReceived: parseFloat(actualCash),
    change: parseFloat(change),
    discountRate: parseFloat(discountRate),
    frontendTotal: parseFloat(total),
    products: cart2.map((item) => ({
      product_id: item.id,
      quantity: item.quantity
    }))
  };
  try {
    const response = await fetch("/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData)
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const result = await response.json();
    const ticket = result.ticket;
    const details = result.ticketDetails;
    const printData = { ticket, details: result.ticketDetails, printerIP: printerConfig.ip };
    await window.api.printTicket(printData);
    await window.api.printKitchen(printData);
    return result;
  } catch (error) {
    console.error("Error: sale commit", error);
    throw error;
  }
}
const returnIcon = "data:image/svg+xml,%3csvg%20width='84'%20height='63'%20viewBox='0%200%2084%2063'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M24.358%200.113281H55.4925C57.0264%200.11689%2058.2678%201.36191%2058.2714%202.89193V8.44924C58.2678%209.98296%2057.0263%2011.2243%2055.4925%2011.2279H24.358C17.3457%2011.2892%2011.694%2016.9873%2011.694%2023.9987C11.694%2031.0067%2017.3457%2036.7086%2024.358%2036.7659H64.2049L59.4483%2032.0097L59.4519%2032.0133C57.2902%2029.8372%2057.2902%2026.3261%2059.4519%2024.1537C61.6246%2021.9921%2065.136%2021.9921%2067.3087%2024.1537L82.7803%2039.6202C84.1878%2041.0347%2084.1878%2043.319%2082.7803%2044.73L67.013%2060.4921C64.8404%2062.6537%2061.3289%2062.6537%2059.1563%2060.4921C56.9945%2058.3161%2056.9945%2054.8049%2059.1563%2052.6325L63.9129%2047.8763H24.3588C15.9138%2047.75%208.16186%2043.1706%203.97566%2035.8344C-0.210536%2028.4982%20-0.210721%2019.4976%203.97566%2012.1616C8.16205%204.82558%2015.9143%200.246225%2024.3588%200.115967L24.358%200.113281Z'%20fill='%23191D22'/%3e%3c/svg%3e";
const resetIcon = "data:image/svg+xml,%3csvg%20width='30'%20height='30'%20viewBox='0%200%2030%2030'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M24%203.002C21.492%201.117%2018.375%200%2015%200C6.721%200%200%206.721%200%2015C0%2023.279%206.721%2030%2015%2030C22.891%2030%2029.366%2023.893%2029.956%2016.152C30.04%2015.051%2029.215%2014.09%2028.114%2014.006C27.013%2013.922%2026.052%2014.747%2025.968%2015.848C25.535%2021.524%2020.786%2026%2015%2026C8.929%2026%204%2021.071%204%2015C4%208.929%208.929%204%2015%204C17.352%204%2019.533%204.74%2021.322%206H20C18.896%206%2018%206.896%2018%208C18%209.104%2018.896%2010%2020%2010H26C27.105%2010%2028%209.105%2028%208V2C28%200.896%2027.104%200%2026%200C24.896%200%2024%200.896%2024%202V3.002Z'%20fill='%23191D22'/%3e%3c/svg%3e";
const cardIcon = "data:image/svg+xml,%3csvg%20width='52'%20height='34'%20viewBox='0%200%2052%2034'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M3.50967%200H48.0908C50.0219%200%2051.6005%201.57706%2051.6005%203.50967V30.4903C51.6005%2032.4214%2050.0219%2034%2048.0908%2034H3.50967C1.57864%2034%200%2032.4214%200%2030.4903V3.50967C0%201.57864%201.57864%200%203.50967%200ZM41.0225%2024.7415C41.6988%2024.7415%2042.3167%2024.9896%2042.7892%2025.4004C43.2633%2024.9912%2043.8811%2024.7415%2044.5559%2024.7415C46.0476%2024.7415%2047.258%2025.9519%2047.258%2027.4437C47.258%2028.9354%2046.0476%2030.1458%2044.5559%2030.1458C43.8811%2030.1458%2043.2633%2029.8978%2042.7892%2029.4885C42.3167%2029.8978%2041.6988%2030.1458%2041.0225%2030.1458C39.5308%2030.1458%2038.3203%2028.9354%2038.3203%2027.4437C38.3203%2025.9519%2039.5308%2024.7415%2041.0225%2024.7415ZM6.13757%2029.4585C4.73434%2029.4585%204.73434%2027.3252%206.13757%2027.3252H31.7055C33.1088%2027.3252%2033.1088%2029.4585%2031.7055%2029.4585H6.13757ZM10.3252%2016.5054L8.64538%2020.1841H12.1456L13.8253%2016.5054H10.3252ZM6.30982%2020.1841L7.98959%2016.5054H5.9353C5.73146%2016.5054%205.56079%2016.6761%205.56079%2016.8799V19.808C5.56079%2020.0119%205.73146%2020.1826%205.9353%2020.1826H6.30982V20.1841ZM33.6682%2016.5054L31.9884%2020.1841H34.0443C34.2481%2020.1841%2034.4188%2020.0119%2034.4188%2019.8096V16.8815C34.4188%2016.6776%2034.2481%2016.507%2034.0443%2016.507H33.6682V16.5054ZM29.6528%2020.1841L31.3326%2016.5054H27.8324L26.1526%2020.1841H29.6528ZM23.8171%2020.1841L25.4968%2016.5054H21.9967L20.3169%2020.1841H23.8171ZM17.9813%2020.1841L19.6611%2016.5054H16.1609L14.4811%2020.1841H17.9813ZM5.9353%2014.3721H34.0443C35.4254%2014.3721%2036.5536%2015.4988%2036.5536%2016.8815V19.8096C36.5536%2021.1923%2035.4269%2022.319%2034.0443%2022.319H5.9353C4.55261%2022.319%203.42592%2021.1923%203.42592%2019.8096V16.8815C3.42592%2015.4988%204.55261%2014.3721%205.9353%2014.3721ZM2.1333%204.97769H49.4656V3.51125C49.4656%202.75748%2048.8446%202.13646%2048.0908%202.13646H3.50967C2.7559%202.13646%202.13488%202.75906%202.13488%203.51125V4.97769H2.1333ZM49.4656%2012.4806H2.1333V30.4919C2.1333%2031.2457%202.75432%2031.8667%203.50809%2031.8667H48.0892C48.843%2031.8667%2049.464%2031.2457%2049.464%2030.4919V12.4806H49.4656Z'%20fill='%23191D22'/%3e%3c/svg%3e";
const cashIcon = "data:image/svg+xml,%3csvg%20width='61'%20height='35'%20viewBox='0%200%2061%2035'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M56.2159%200H4.78412C2.14689%200%200%201.86533%200%204.1567V30.136C0%2032.4274%202.14689%2034.2927%204.78412%2034.2927H56.2159C58.8531%2034.2927%2061%2032.4274%2061%2030.136V4.1567C61%201.86533%2058.8531%200%2056.2159%200ZM58.6079%2030.1382C58.6079%2031.285%2057.5357%2032.2166%2056.2159%2032.2166H4.78412C3.4643%2032.2166%202.39209%2031.285%202.39209%2030.1382V4.15675C2.39209%203.01002%203.4643%202.07843%204.78412%202.07843H56.2159C57.5357%202.07843%2058.6079%203.01002%2058.6079%204.15675V30.1382Z'%20fill='%23191D22'/%3e%3cpath%20d='M55.0205%204.15625H5.98117C5.31999%204.15625%204.78516%204.62097%204.78516%205.19541V29.0966C4.78516%2029.6711%205.32003%2030.1358%205.98117%2030.1358H55.0205C55.6817%2030.1358%2056.2165%2029.671%2056.2165%2029.0966V5.19541C56.2165%204.62309%2055.6817%204.15625%2055.0205%204.15625ZM22.3984%2028.0591H13.0582C12.5531%2025.4515%2010.1808%2023.3903%207.17966%2022.9515L7.17718%2011.3421C10.1784%2010.9032%2012.5507%208.84203%2013.0558%206.23446H22.3959C18.2804%208.5516%2015.549%2012.5773%2015.549%2017.1466C15.549%2021.7158%2018.2802%2025.742%2022.3984%2028.0591ZM29.4013%2015.7117C29.696%2015.9677%2030.0847%2016.1075%2030.5008%2016.1075C32.6898%2016.1075%2034.4479%2017.648%2034.4479%2019.537C34.4479%2021.0667%2033.2915%2022.3641%2031.6969%2022.8052V24.3177C31.6969%2024.8921%2031.162%2025.3568%2030.5008%2025.3568C29.8397%2025.3568%2029.3048%2024.8921%2029.3048%2024.3177V22.9665H27.7498C27.0886%2022.9665%2026.5537%2022.5018%2026.5537%2021.9274C26.5537%2021.3529%2027.0886%2020.8882%2027.7498%2020.8882H30.5008C31.3576%2020.8882%2032.0559%2020.2815%2032.0559%2019.5371C32.0559%2018.7992%2031.37%2018.186%2030.5008%2018.186C28.3217%2018.186%2026.5537%2016.6519%2026.5537%2014.7565C26.5537%2013.2289%2027.7051%2011.9273%2029.3048%2011.4862V9.97584C29.3048%209.40138%2029.8396%208.93668%2030.5008%208.93668C31.1619%208.93668%2031.6968%209.4014%2031.6968%209.97584V11.327H33.2519C33.913%2011.327%2034.4479%2011.7917%2034.4479%2012.3661C34.4479%2012.9406%2033.913%2013.4053%2033.2519%2013.4053H30.5008C30.0848%2013.4053%2029.696%2013.5451%2029.4013%2013.8012C28.7946%2014.3283%2028.7922%2015.1824%2029.4013%2015.7117ZM53.8243%2022.9517C50.8231%2023.3906%2048.4508%2025.4517%2047.9457%2028.0593H38.6056C42.7211%2025.7422%2045.4525%2021.7165%2045.4525%2017.1472C45.4525%2012.5779%2042.7212%208.55226%2038.6056%206.23512H47.9457C48.4509%208.84275%2050.8231%2010.9039%2053.8243%2011.3427V22.9517Z'%20fill='%23191D22'/%3e%3c/svg%3e";
const bill50 = "/_app/immutable/assets/bill-50.BK3OUxnx.jpg";
const bill100 = "/_app/immutable/assets/bill-100.D4LR0M-N.jpg";
const bill200 = "/_app/immutable/assets/bill-200.Uz-hHio7.jpg";
const bill500 = "/_app/immutable/assets/bill-500.QBRF3xjg.jpg";
function Cash($$payload, $$props) {
  push();
  let { total, ready = void 0, discountRate, reset } = $$props;
  let cash = 0;
  let card = 0;
  let received = cash + card;
  let pending = total > received ? total - received : 0;
  let change = received - total < 0 ? 0 : received - total;
  function numkey($$payload2, number) {
    $$payload2.out += `<button class="svelte-rpxvbl">${escape_html(number)}</button>`;
  }
  function bill($$payload2, value, src) {
    $$payload2.out += `<button class="bill svelte-rpxvbl"${attr("disabled", value < total, true)}><img${attr("src", src)}${attr("alt", `billete de ${stringify(value)}`)} class="svelte-rpxvbl"></button>`;
  }
  $$payload.out += `<div class="cash svelte-rpxvbl"><div class="cash--header svelte-rpxvbl"><div class="row svelte-rpxvbl"><div class="field svelte-rpxvbl"><p class="label svelte-rpxvbl">tarjeta</p> <input${attr("value", card)} type="number" name="tarjeta" class="svelte-rpxvbl"></div> <div class="field svelte-rpxvbl"><p class="label svelte-rpxvbl">efectivo</p> <input${attr("value", cash)} type="number" name="efectivo" class="svelte-rpxvbl"></div></div> <div class="row svelte-rpxvbl"><p class="label svelte-rpxvbl">total</p> <p class="amount svelte-rpxvbl">${escape_html(total % 1 !== 0 ? total.toFixed(2) : total)}</p></div> <div class="row svelte-rpxvbl"><p class="label svelte-rpxvbl">pendiente</p> <p${attr_class(`amount ${stringify(pending > 0 ? "accent" : "")}`, "svelte-rpxvbl")}>${escape_html(pending % 1 !== 0 ? pending.toFixed(2) : pending)}</p></div> <div class="row svelte-rpxvbl"><p class="label svelte-rpxvbl">cambio</p> <p${attr_class(`amount change ${stringify(change > 0 ? "accent" : "")}`, "svelte-rpxvbl")}>${escape_html(change % 1 !== 0 ? change.toFixed(2) : change)}</p></div></div> <div class="cash--body svelte-rpxvbl"><div class="bills svelte-rpxvbl">`;
  bill($$payload, 50, bill50);
  $$payload.out += `<!----> `;
  bill($$payload, 100, bill100);
  $$payload.out += `<!----> `;
  bill($$payload, 200, bill200);
  $$payload.out += `<!----> `;
  bill($$payload, 500, bill500);
  $$payload.out += `<!----></div> <div class="numpad svelte-rpxvbl">`;
  numkey($$payload, "7");
  $$payload.out += `<!----> `;
  numkey($$payload, "8");
  $$payload.out += `<!----> `;
  numkey($$payload, "9");
  $$payload.out += `<!----> `;
  numkey($$payload, "4");
  $$payload.out += `<!----> `;
  numkey($$payload, "5");
  $$payload.out += `<!----> `;
  numkey($$payload, "6");
  $$payload.out += `<!----> `;
  numkey($$payload, "1");
  $$payload.out += `<!----> `;
  numkey($$payload, "2");
  $$payload.out += `<!----> `;
  numkey($$payload, "3");
  $$payload.out += `<!----> `;
  numkey($$payload, "0");
  $$payload.out += `<!----> <button class="double svelte-rpxvbl">borrar</button></div></div> <div class="cash--footer svelte-rpxvbl"><button class="confirmBtn svelte-rpxvbl"${attr("disabled", pending > 0, true)}><img${attr("src", confirmIcon)} alt="confirmar" class="svelte-rpxvbl"></button></div></div>`;
  bind_props($$props, { ready });
  pop();
}
const plusIcon = "data:image/svg+xml,%3csvg%20width='15'%20height='16'%20viewBox='0%200%2015%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_1321_1209)'%3e%3cpath%20d='M13.649%206.38493H9.27047V1.97908C9.27047%201.43844%208.83475%201%208.29747%201H7.32448C6.7872%201%206.35148%201.43844%206.35148%201.97908V6.38493H1.973C1.43572%206.38493%201%206.82337%201%207.364V8.34308C1%208.88372%201.43572%209.32216%201.973%209.32216H6.35148V13.728C6.35148%2014.2686%206.7872%2014.7071%207.32448%2014.7071H8.29747C8.83475%2014.7071%209.27047%2014.2686%209.27047%2013.728V9.32216H13.649C14.1862%209.32216%2014.622%208.88372%2014.622%208.34308V7.364C14.622%206.82337%2014.1862%206.38493%2013.649%206.38493Z'%20fill='%2334383e'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_1321_1209'%3e%3crect%20width='13.622'%20height='15.6652'%20fill='white'%20transform='translate(0.8125%200.125)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const deleteIcon = "data:image/svg+xml,%3csvg%20width='96'%20height='96'%20viewBox='0%200%2096%2096'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M92.7475%202.8275C96.5175%206.6075%2096.5175%2012.7775%2092.7475%2016.5475L61.5075%2047.7875L92.7475%2079.0275C96.5175%2082.7975%2096.5175%2088.9675%2092.7475%2092.7475C88.9675%2096.5175%2082.7975%2096.5175%2079.0275%2092.7475L47.7875%2061.5075L16.5475%2092.7475C12.7775%2096.5175%206.6075%2096.5175%202.8275%2092.7475C-0.9425%2088.9675%20-0.9425%2082.7975%202.8275%2079.0275L34.0675%2047.7875L2.8275%2016.5475C-0.9425%2012.7775%20-0.9425%206.6075%202.8275%202.8275C6.6075%20-0.9425%2012.7775%20-0.9425%2016.5475%202.8275L47.7875%2034.0675L79.0275%202.8275C82.7975%20-0.9425%2088.9675%20-0.9425%2092.7475%202.8275Z'%20fill='%23191D22'/%3e%3c/svg%3e";
function OrderItem($$payload, $$props) {
  push();
  let { item } = $$props;
  $$payload.out += `<li class="item svelte-7olwyn"><div class="field svelte-7olwyn"><button class="circle"><img${attr("src", plusIcon)} alt="más" draggable="false"></button> <!---->`;
  {
    $$payload.out += `<p class="qty svelte-7olwyn">${escape_html(item.quantity)}</p>`;
  }
  $$payload.out += `<!----></div> <div class="field svelte-7olwyn"><p class="lineitem">${escape_html(item.name)}</p></div> <div class="field currency svelte-7olwyn"><p>${escape_html(item.price)}</p></div> <div class="field currency svelte-7olwyn"><!---->`;
  {
    $$payload.out += `<p>${escape_html(item.price * item.quantity)}</p>`;
  }
  $$payload.out += `<!----></div> <div class="field svelte-7olwyn"><button class="circle"><img${attr("src", deleteIcon)} alt="eliminar"></button></div></li>`;
  pop();
}
function Order($$payload, $$props) {
  push();
  let subtotal = cart.reduce(
    (acc, item) => {
      const price = parseFloat(item.price);
      const quantity = parseFloat(item.quantity);
      return acc + price * quantity;
    },
    0
  );
  let discounted = false;
  let discountInput = 0;
  let discountRate = discountInput / 100;
  let discountAmount = Math.round(subtotal * discountRate * 100) / 100;
  let total = subtotal - discountAmount;
  let readyForCardPayment = false;
  let readyForCashPayment = false;
  function reset() {
    readyForCashPayment = false;
    readyForCardPayment = false;
    discounted = false;
    discountInput = 0;
    cart.length = 0;
  }
  function handleDiscount() {
    if (discounted) {
      discountInput = 0;
      discounted = false;
    } else {
      discounted = true;
    }
  }
  function handleCashBtn() {
    if (readyForCardPayment) {
      readyForCardPayment = false;
      return;
    }
    if (!readyForCashPayment) {
      readyForCashPayment = true;
    } else {
      readyForCashPayment = false;
    }
  }
  async function handleCardBtn() {
    if (readyForCashPayment) {
      readyForCashPayment = false;
      return;
    }
    if (!readyForCardPayment) {
      readyForCardPayment = true;
    } else {
      const cardSale = await commitSale(cart, total, 0, total, discountRate, 0, 0);
      if (cardSale.status == 200) {
        reset();
      }
    }
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="order svelte-1fanv0g"><div class="panel svelte-1fanv0g"><div class="panel--header svelte-1fanv0g"><p class="svelte-1fanv0g">cantidad</p> <p class="svelte-1fanv0g">producto</p> <p class="svelte-1fanv0g">precio</p> <p class="svelte-1fanv0g">importe</p></div> <div${attr_class(`panel--body ${stringify(cart.length < 1 ? "empty" : "")}`, "svelte-1fanv0g")}>`;
    if (cart.length > 0) {
      $$payload2.out += "<!--[-->";
      const each_array = ensure_array_like(cart);
      $$payload2.out += `<div class="container svelte-1fanv0g">`;
      if (readyForCashPayment) {
        $$payload2.out += "<!--[-->";
        Cash($$payload2, {
          total,
          discountRate,
          reset,
          get ready() {
            return readyForCashPayment;
          },
          set ready($$value) {
            readyForCashPayment = $$value;
            $$settled = false;
          }
        });
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> <button class="circle reset svelte-1fanv0g"><img${attr("src", resetIcon)} alt="Borrar"></button> <ul${attr_class(clsx(["order--items", { discounted }]), "svelte-1fanv0g")}><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        OrderItem($$payload2, { item });
      }
      $$payload2.out += `<!--]--></ul> <footer class="svelte-1fanv0g">`;
      if (discounted) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="discount svelte-1fanv0g"><div class="discount--row svelte-1fanv0g"><p class="discount--label svelte-1fanv0g">subtotal</p> <p class="discount--amount svelte-1fanv0g">${escape_html(subtotal)}</p></div> <div class="discount--row svelte-1fanv0g"><p class="discount--label svelte-1fanv0g">descuento</p> <div class="discount--input svelte-1fanv0g"><input${attr("value", discountInput)} type="number" min="0" max="100" class="svelte-1fanv0g"> <p class="discount--input__sign svelte-1fanv0g">%</p></div> <p class="discount--amount svelte-1fanv0g">${escape_html(discountAmount % 1 !== 0 ? discountAmount.toFixed(2) : discountAmount)}</p></div></div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> <div class="summary svelte-1fanv0g"><p class="summary--label svelte-1fanv0g">Total</p> <p class="summary--amount svelte-1fanv0g">${escape_html(total % 1 !== 0 ? total.toFixed(2) : total)}</p></div> <div class="buttonRow svelte-1fanv0g">`;
      ActionButton($$payload2, {
        readyImg: returnIcon,
        readyAlt: "cancelar",
        imgSrc: cashIcon,
        imgAlt: "efectivo",
        flexBasis: "50%",
        action: handleCashBtn,
        goback: "true",
        get ready() {
          return readyForCashPayment;
        },
        set ready($$value) {
          readyForCashPayment = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      ActionButton($$payload2, {
        readyImg: confirmIcon,
        readyAlt: "confirmar",
        imgSrc: cardIcon,
        imgAlt: "tarjeta",
        flexBasis: "50%",
        action: handleCardBtn,
        get ready() {
          return readyForCardPayment;
        },
        set ready($$value) {
          readyForCardPayment = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      ActionButton($$payload2, {
        flexBasis: "15%",
        action: handleDiscount,
        text: "%",
        ready: discounted
      });
      $$payload2.out += `<!----></div></footer></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div></div></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  let { cats, products } = data;
  let filteredProducts = products.filter((product) => product.catproduct_id === selectedCat.cat);
  $$payload.out += `<div class="grid svelte-5wt3hs">`;
  CatMenu($$payload, { cats });
  $$payload.out += `<!----> `;
  Display($$payload, { filteredProducts });
  $$payload.out += `<!----> `;
  Order($$payload);
  $$payload.out += `<!----></div>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Ba_jXP4b.js.map
