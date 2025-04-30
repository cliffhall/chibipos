import { p as push, o as copy_payload, q as assign_payload, h as pop, m as ensure_array_like, n as attr_class, k as escape_html, v as stringify, t as attr, w as bind_props } from './index2-CB4_g73u.js';
import { A as ActionButton } from './ActionButton-D-bIh0W6.js';
import { p as printerConfig } from './shared.svelte-6ln_Ry7j.js';

function Calendar($$payload, $$props) {
  push();
  let { tickets = void 0 } = $$props;
  const labels = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
  let selectedDate = /* @__PURE__ */ new Date();
  const today = /* @__PURE__ */ new Date();
  today.getMonth();
  today.getFullYear();
  let selectedMonth = today.getMonth();
  let selectedYear = today.getFullYear();
  let monthName = new Date(selectedYear, selectedMonth).toLocaleString("es", { month: "long" });
  let days = [];
  const each_array = ensure_array_like(labels);
  const each_array_1 = ensure_array_like(days);
  $$payload.out += `<div class="calendar svelte-10fq9ck"><div class="header svelte-10fq9ck"><div class="month svelte-10fq9ck"><button class="svelte-10fq9ck">-</button> <div class="text svelte-10fq9ck"><p class="title svelte-10fq9ck">${escape_html(monthName)}</p> <p class="year svelte-10fq9ck">${escape_html(selectedYear)}</p></div> <button class="svelte-10fq9ck">+</button></div> <div class="labels svelte-10fq9ck"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let label = each_array[$$index];
    $$payload.out += `<div class="day svelte-10fq9ck"><p class="svelte-10fq9ck">${escape_html(label)}</p></div>`;
  }
  $$payload.out += `<!--]--></div></div> <div class="body svelte-10fq9ck"><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let day = each_array_1[$$index_1];
    $$payload.out += `<button${attr_class(`day square ${stringify(day.today ? "today" : "")} ${stringify(!day.current ? "notcurrent" : "")} ${stringify(selectedDate.getDate() === day.day && selectedDate.getMonth() === day.month && selectedDate.getFullYear() === selectedYear ? "selected" : "")}`, "svelte-10fq9ck")}><p class="svelte-10fq9ck">${escape_html(day.day)}</p></button>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  bind_props($$props, { tickets });
  pop();
}
function TicketItem($$payload, $$props) {
  let { ticketItem } = $$props;
  const { product, quantity, price } = ticketItem;
  let extPrice = quantity * price;
  $$payload.out += `<li class="item svelte-1sknmpi"><div class="field currency svelte-1sknmpi"><p class="lineitem">${escape_html(quantity)}</p></div> <div class="field svelte-1sknmpi"><p class="lineitem">${escape_html(product.name)}</p></div> <div class="field currency svelte-1sknmpi"><p class="lineitem">${escape_html(price)}</p></div> <div class="field currency svelte-1sknmpi"><p class="lineitem">${escape_html(extPrice)}</p></div></li>`;
}
const cardIcon = "data:image/svg+xml,%3csvg%20width='52'%20height='34'%20viewBox='0%200%2052%2034'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M3.50967%200H48.0908C50.0219%200%2051.6005%201.57706%2051.6005%203.50967V30.4903C51.6005%2032.4214%2050.0219%2034%2048.0908%2034H3.50967C1.57864%2034%200%2032.4214%200%2030.4903V3.50967C0%201.57864%201.57864%200%203.50967%200ZM41.0225%2024.7415C41.6988%2024.7415%2042.3167%2024.9896%2042.7892%2025.4004C43.2633%2024.9912%2043.8811%2024.7415%2044.5559%2024.7415C46.0476%2024.7415%2047.258%2025.9519%2047.258%2027.4437C47.258%2028.9354%2046.0476%2030.1458%2044.5559%2030.1458C43.8811%2030.1458%2043.2633%2029.8978%2042.7892%2029.4885C42.3167%2029.8978%2041.6988%2030.1458%2041.0225%2030.1458C39.5308%2030.1458%2038.3203%2028.9354%2038.3203%2027.4437C38.3203%2025.9519%2039.5308%2024.7415%2041.0225%2024.7415ZM6.13757%2029.4585C4.73434%2029.4585%204.73434%2027.3252%206.13757%2027.3252H31.7055C33.1088%2027.3252%2033.1088%2029.4585%2031.7055%2029.4585H6.13757ZM10.3252%2016.5054L8.64538%2020.1841H12.1456L13.8253%2016.5054H10.3252ZM6.30982%2020.1841L7.98959%2016.5054H5.9353C5.73146%2016.5054%205.56079%2016.6761%205.56079%2016.8799V19.808C5.56079%2020.0119%205.73146%2020.1826%205.9353%2020.1826H6.30982V20.1841ZM33.6682%2016.5054L31.9884%2020.1841H34.0443C34.2481%2020.1841%2034.4188%2020.0119%2034.4188%2019.8096V16.8815C34.4188%2016.6776%2034.2481%2016.507%2034.0443%2016.507H33.6682V16.5054ZM29.6528%2020.1841L31.3326%2016.5054H27.8324L26.1526%2020.1841H29.6528ZM23.8171%2020.1841L25.4968%2016.5054H21.9967L20.3169%2020.1841H23.8171ZM17.9813%2020.1841L19.6611%2016.5054H16.1609L14.4811%2020.1841H17.9813ZM5.9353%2014.3721H34.0443C35.4254%2014.3721%2036.5536%2015.4988%2036.5536%2016.8815V19.8096C36.5536%2021.1923%2035.4269%2022.319%2034.0443%2022.319H5.9353C4.55261%2022.319%203.42592%2021.1923%203.42592%2019.8096V16.8815C3.42592%2015.4988%204.55261%2014.3721%205.9353%2014.3721ZM2.1333%204.97769H49.4656V3.51125C49.4656%202.75748%2048.8446%202.13646%2048.0908%202.13646H3.50967C2.7559%202.13646%202.13488%202.75906%202.13488%203.51125V4.97769H2.1333ZM49.4656%2012.4806H2.1333V30.4919C2.1333%2031.2457%202.75432%2031.8667%203.50809%2031.8667H48.0892C48.843%2031.8667%2049.464%2031.2457%2049.464%2030.4919V12.4806H49.4656Z'%20fill='%23fbc02a'/%3e%3c/svg%3e";
const cashIcon = "data:image/svg+xml,%3csvg%20width='61'%20height='35'%20viewBox='0%200%2061%2035'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M56.2159%200H4.78412C2.14689%200%200%201.86533%200%204.1567V30.136C0%2032.4274%202.14689%2034.2927%204.78412%2034.2927H56.2159C58.8531%2034.2927%2061%2032.4274%2061%2030.136V4.1567C61%201.86533%2058.8531%200%2056.2159%200ZM58.6079%2030.1382C58.6079%2031.285%2057.5357%2032.2166%2056.2159%2032.2166H4.78412C3.4643%2032.2166%202.39209%2031.285%202.39209%2030.1382V4.15675C2.39209%203.01002%203.4643%202.07843%204.78412%202.07843H56.2159C57.5357%202.07843%2058.6079%203.01002%2058.6079%204.15675V30.1382Z'%20fill='%23191D22'/%3e%3cpath%20d='M55.0205%204.15625H5.98117C5.31999%204.15625%204.78516%204.62097%204.78516%205.19541V29.0966C4.78516%2029.6711%205.32003%2030.1358%205.98117%2030.1358H55.0205C55.6817%2030.1358%2056.2165%2029.671%2056.2165%2029.0966V5.19541C56.2165%204.62309%2055.6817%204.15625%2055.0205%204.15625ZM22.3984%2028.0591H13.0582C12.5531%2025.4515%2010.1808%2023.3903%207.17966%2022.9515L7.17718%2011.3421C10.1784%2010.9032%2012.5507%208.84203%2013.0558%206.23446H22.3959C18.2804%208.5516%2015.549%2012.5773%2015.549%2017.1466C15.549%2021.7158%2018.2802%2025.742%2022.3984%2028.0591ZM29.4013%2015.7117C29.696%2015.9677%2030.0847%2016.1075%2030.5008%2016.1075C32.6898%2016.1075%2034.4479%2017.648%2034.4479%2019.537C34.4479%2021.0667%2033.2915%2022.3641%2031.6969%2022.8052V24.3177C31.6969%2024.8921%2031.162%2025.3568%2030.5008%2025.3568C29.8397%2025.3568%2029.3048%2024.8921%2029.3048%2024.3177V22.9665H27.7498C27.0886%2022.9665%2026.5537%2022.5018%2026.5537%2021.9274C26.5537%2021.3529%2027.0886%2020.8882%2027.7498%2020.8882H30.5008C31.3576%2020.8882%2032.0559%2020.2815%2032.0559%2019.5371C32.0559%2018.7992%2031.37%2018.186%2030.5008%2018.186C28.3217%2018.186%2026.5537%2016.6519%2026.5537%2014.7565C26.5537%2013.2289%2027.7051%2011.9273%2029.3048%2011.4862V9.97584C29.3048%209.40138%2029.8396%208.93668%2030.5008%208.93668C31.1619%208.93668%2031.6968%209.4014%2031.6968%209.97584V11.327H33.2519C33.913%2011.327%2034.4479%2011.7917%2034.4479%2012.3661C34.4479%2012.9406%2033.913%2013.4053%2033.2519%2013.4053H30.5008C30.0848%2013.4053%2029.696%2013.5451%2029.4013%2013.8012C28.7946%2014.3283%2028.7922%2015.1824%2029.4013%2015.7117ZM53.8243%2022.9517C50.8231%2023.3906%2048.4508%2025.4517%2047.9457%2028.0593H38.6056C42.7211%2025.7422%2045.4525%2021.7165%2045.4525%2017.1472C45.4525%2012.5779%2042.7212%208.55226%2038.6056%206.23512H47.9457C48.4509%208.84275%2050.8231%2010.9039%2053.8243%2011.3427V22.9517Z'%20fill='%23fbc02a'/%3e%3c/svg%3e";
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  let tickets = data.tickets;
  let currentTicket = {};
  let ticketItems = currentTicket.ticket_details;
  let dateObject = new Date(currentTicket.date);
  let cancelReady = false;
  let printReady = false;
  let date = dateObject.toLocaleString(void 0, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "long",
    day: "2-digit"
  });
  async function cancelTicket() {
    if (printReady) {
      printReady = false;
      cancelReady = false;
      return;
    }
    if (cancelReady) {
      try {
        const response = await fetch(`/api/ticket/${currentTicket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" }
        });
        const canceled = await response.json();
        if (canceled) {
          const selectedYear = dateObject.getFullYear();
          const formattedDay = dateObject.toLocaleDateString("en-US", { day: "2-digit" });
          const formattedMonth = dateObject.toLocaleDateString("en-US", { month: "2-digit" });
          const ticketRequest = await fetch(`/api/ticket?date=${selectedYear}-${formattedMonth}-${formattedDay}`);
          tickets = await ticketRequest.json();
          cancelReady = false;
        }
      } catch (error) {
        console.error("Could not cancel ticket: ", error);
      }
    } else {
      cancelReady = true;
    }
  }
  let printPromise = null;
  let printTimeout = null;
  let resetTime;
  async function handlePrint(ticket) {
    if (printTimeout) clearTimeout(printTimeout);
    if (printReady) {
      printPromise = printTicket();
      printPromise.finally(() => {
        printTimeout = setTimeout(
          () => {
            printPromise = null;
          },
          resetTime
        );
      });
    } else {
      printPromise = null;
      printTicket();
    }
  }
  async function printTicket(ticket) {
    if (cancelReady) {
      printReady = false;
      cancelReady = false;
      return;
    }
    if (printReady) {
      const printData = {
        ticket: currentTicket,
        details: ticketItems,
        printerIP: printerConfig.ip
      };
      const response = await window.api.printTicket(JSON.parse(JSON.stringify(printData)));
      printReady = false;
      if (response.success) {
        resetTime = 300;
      } else {
        resetTime = 5e3;
      }
      return response;
    } else {
      printReady = true;
      return Promise.resolve();
    }
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(tickets);
    $$payload2.out += `<main class="ticketpage svelte-kk4496"><div class="calendar svelte-kk4496">`;
    Calendar($$payload2, {
      get tickets() {
        return tickets;
      },
      set tickets($$value) {
        tickets = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></div> <div class="table-wrapper svelte-kk4496"><div class="table"><div class="table--header"><p>fecha</p> <p>total</p></div> <ul class="table--body"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let ticket = each_array[$$index];
      $$payload2.out += `<li${attr_class(`table--item ${stringify(currentTicket.id === ticket.id ? "selected" : "")}`)}><button><p class="date">${escape_html(new Date(ticket.date).toLocaleTimeString(void 0, {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }))}</p> <p class="number">${escape_html(ticket.total_amount)}</p> <div class="payment">`;
      if (ticket.card > 0) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="icon card"><img${attr("src", cardIcon)} alt="tarjeta"></div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> `;
      if (ticket.cash > 0) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<div class="icon cash"><img${attr("src", cashIcon)} alt="efectivo"></div>`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--></div> <div${attr_class(`cancel ${stringify(ticket.canceled ? "cancelado" : "")}`)}></div></button></li>`;
    }
    $$payload2.out += `<!--]--></ul></div></div> <div class="panel-wrapper svelte-kk4496">`;
    if (currentTicket.id) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<div class="panel svelte-kk4496"><!---->`;
      {
        const each_array_1 = ensure_array_like(currentTicket.ticket_details);
        $$payload2.out += `<div class="panel--header svelte-kk4496"><div class="biginfo svelte-kk4496"><p class="title">${escape_html(currentTicket.id.slice(0, 8))}</p> <p class="title">${escape_html(date)}</p></div> <div class="labels svelte-kk4496"><p class="svelte-kk4496">cantidad</p> <p class="svelte-kk4496">producto</p> <p class="svelte-kk4496">precio</p> <p class="svelte-kk4496">importe</p></div></div> <ul class="panel--body svelte-kk4496"><!--[-->`;
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let ticketItem = each_array_1[$$index_1];
          TicketItem($$payload2, { ticketItem });
        }
        $$payload2.out += `<!--]--></ul> <footer class="svelte-kk4496"><p>${escape_html(currentTicket.cash)}</p> <p>${escape_html(currentTicket.card)}</p> <div class="summary svelte-kk4496"><p class="summary--label svelte-kk4496">Total</p> <p class="summary--amount svelte-kk4496">${escape_html(currentTicket.total_amount)}</p></div> <div class="buttonRow svelte-kk4496">`;
        ActionButton($$payload2, {
          action: cancelTicket,
          text: "cancelar",
          flexBasis: "50%",
          ready: cancelReady,
          disabled: currentTicket.canceled
        });
        $$payload2.out += `<!----> `;
        ActionButton($$payload2, {
          action: handlePrint,
          text: "imprimir",
          flexBasis: "50%",
          ready: printReady,
          promise: printPromise
        });
        $$payload2.out += `<!----></div></footer>`;
      }
      $$payload2.out += `<!----></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div></main>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-yrbBlK4Z.js.map
