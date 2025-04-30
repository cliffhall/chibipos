import { p as push, o as copy_payload, q as assign_payload, h as pop, m as ensure_array_like, k as escape_html } from './index2-CB4_g73u.js';
import { A as ActionButton } from './ActionButton-D-bIh0W6.js';
import { c as confirmIcon } from './confirm-DxxL-lrh.js';

const downloadIcon = "data:image/svg+xml,%3csvg%20width='23'%20height='23'%20viewBox='0%200%2023%2023'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M21.25%2015C20.9186%2015.0005%2020.601%2015.1324%2020.3667%2015.3667C20.1324%2015.601%2020.0005%2015.9186%2020%2016.25V19.25C19.9995%2019.4488%2019.9203%2019.6392%2019.7797%2019.7797C19.6392%2019.9203%2019.4488%2019.9995%2019.25%2020H3.25C3.05125%2019.9995%202.86079%2019.9203%202.72025%2019.7797C2.57971%2019.6392%202.50053%2019.4488%202.5%2019.25V16.25C2.5%2015.9185%202.3683%2015.6005%202.13388%2015.3661C1.89946%2015.1317%201.58152%2015%201.25%2015C0.918479%2015%200.600537%2015.1317%200.366117%2015.3661C0.131696%2015.6005%200%2015.9185%200%2016.25V19.25C0.00105851%2020.1116%200.343808%2020.9377%200.953072%2021.5469C1.56234%2022.1562%202.38837%2022.4989%203.25%2022.5H19.25C20.1116%2022.4989%2020.9377%2022.1562%2021.5469%2021.5469C22.1562%2020.9377%2022.4989%2020.1116%2022.5%2019.25V16.25C22.4995%2015.9186%2022.3676%2015.601%2022.1333%2015.3667C21.899%2015.1324%2021.5814%2015.0005%2021.25%2015Z'%20fill='%23191D22'/%3e%3cpath%20d='M11.2491%200C10.9177%200.000528905%2010.6001%200.132395%2010.3658%200.366701C10.1315%200.601007%209.99962%200.918642%209.99909%201.25V12.581L6.04909%209.29C5.79434%209.07817%205.46596%208.97606%205.136%209.00605C4.80605%209.03605%204.50147%209.19571%204.28909%209.45C4.07726%209.70475%203.97515%2010.0331%204.00514%2010.3631C4.03514%2010.693%204.1948%2010.9976%204.44909%2011.21L10.4491%2016.21C10.5121%2016.2547%2010.579%2016.2935%2010.6491%2016.326C10.6948%2016.3566%2010.7426%2016.384%2010.7921%2016.408C10.9363%2016.4687%2011.0911%2016.5%2011.2476%2016.5C11.404%2016.5%2011.5589%2016.4687%2011.7031%2016.408C11.7514%2016.3839%2011.7981%2016.3569%2011.8431%2016.327C11.9131%2016.2945%2011.9801%2016.2556%2012.0431%2016.211L18.0431%2011.211C18.2403%2011.047%2018.3823%2010.8262%2018.4497%2010.5787C18.5172%2010.3312%2018.5069%2010.0689%2018.4202%209.82751C18.3335%209.58608%2018.1746%209.37717%2017.9651%209.22913C17.7556%209.08109%2017.5056%209.0011%2017.2491%209C16.9568%209.00055%2016.6738%209.10312%2016.4491%209.29L12.4991%2012.581V1.25C12.4986%200.918642%2012.3667%200.601007%2012.1324%200.366701C11.8981%200.132395%2011.5804%200.000528905%2011.2491%200Z'%20fill='%23191D22'/%3e%3c/svg%3e";
const printIcon = "data:image/svg+xml,%3csvg%20width='82'%20height='82'%20viewBox='0%200%2082%2082'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M81.0352%2031.0268C81.0039%2030.9409%2080.9766%2030.8627%2080.9375%2030.7807C80.9102%2030.7182%2080.8985%2030.6518%2080.8633%2030.5893L71.4883%2013.5273C70.9375%2012.5273%2069.8867%2011.9062%2068.75%2011.9062H60.625V3.125C60.625%201.3984%2059.2266%200%2057.5%200H23.75C22.0234%200%2020.625%201.3984%2020.625%203.125V11.9062H12.5C11.3594%2011.9062%2010.3086%2012.5273%209.76171%2013.5273L0.386714%2030.5893C0.351557%2030.6479%200.343745%2030.7182%200.312495%2030.7807C0.273433%2030.8627%200.246089%2030.9448%200.214839%2031.0268C0.097649%2031.351%200.0195287%2031.6909%200.0117188%2032.0307C0.0117188%2032.0541%200%2032.0698%200%2032.0971V65.4411C0%2067.1677%201.3984%2068.5661%203.125%2068.5661H8.9023L5.6757%2077.0153C5.30851%2077.9762%205.43742%2079.0544%206.01945%2079.902C6.60148%2080.7497%207.56635%2081.2536%208.59365%2081.2536L72.2496%2081.2575C73.273%2081.2575%2074.2262%2080.7575%2074.8121%2079.9216C75.3981%2079.0857%2075.5348%2078.0154%2075.1832%2077.0544L72.0777%2068.57H78.1246C79.8512%2068.57%2081.2496%2067.1716%2081.2496%2065.445V32.097C81.2496%2032.0736%2081.2379%2032.0579%2081.2379%2032.0306C81.2301%2031.6908%2081.1524%2031.351%2081.0352%2031.0268ZM26.8752%206.2538H54.3752V19.3158H26.8752V6.2538ZM14.3522%2018.1598H20.6256V19.316H20.0943C18.3677%2019.316%2016.9693%2020.7144%2016.9693%2022.441C16.9693%2024.1676%2018.3677%2025.566%2020.0943%2025.566H61.1563C62.8829%2025.566%2064.2813%2024.1676%2064.2813%2022.441C64.2813%2020.7144%2062.8829%2019.316%2061.1563%2019.316H60.6251V18.1598H66.8985L72.8399%2028.9718H8.40589L14.3473%2018.1598H14.3522ZM13.1334%2075.0038L20.3404%2056.1598H60.8794L64.6567%2066.5118C64.6645%2066.5313%2064.6801%2066.5431%2064.684%2066.5626L67.7699%2075.004L13.1334%2075.0038ZM75.0004%2062.3158H69.7895L67.5356%2056.1596C69.2583%2056.1596%2070.6567%2054.7612%2070.6567%2053.0346C70.6567%2051.308%2069.2583%2049.9096%2067.5317%2049.9096H63.0708H63.063H18.188H18.1802H13.7193C11.9927%2049.9096%2010.5943%2051.308%2010.5943%2053.0346C10.5943%2054.7338%2011.9576%2056.1049%2013.649%2056.144L11.2857%2062.312H6.24656V35.222H75.0006L75.0004%2062.3158Z'%20fill='%23191D22'/%3e%3cpath%20d='M17.4453%2042.5674C17.4453%2046.7354%2011.1953%2046.7354%2011.1953%2042.5674C11.1953%2038.3994%2017.4453%2038.3994%2017.4453%2042.5674Z'%20fill='%23191D22'/%3e%3c/svg%3e";
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  let tmp = data, sales = tmp.sales;
  let selectedSale = {};
  const today = /* @__PURE__ */ new Date();
  today.getMonth();
  today.getFullYear();
  let selectedMonth = today.getMonth();
  let selectedYear = today.getFullYear();
  let monthName = new Date(selectedYear, selectedMonth).toLocaleString("es", { month: "long" });
  let printReady = false;
  let exportReady = false;
  function saveFile(filename, data2) {
    const blob = new Blob([data2], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  async function exportSale(id) {
    if (printReady) {
      exportReady = false;
      printReady = false;
      return;
    }
    if (exportReady) {
      try {
        const request = await fetch(`/api/sale/export?id=${id}`);
        const response = await request.json();
        const sale = response.encryptedSale;
        const fileName = `chibi-SUC-${selectedSale.date}.enc.json`;
        saveFile(fileName, sale);
      } catch (error) {
        console.error("error exporting: ", error);
      }
    } else {
      exportReady = true;
    }
  }
  async function printSale() {
    if (exportReady) {
      exportReady = false;
      printReady = false;
      return;
    }
    if (printReady) {
      try {
        await window.api.printSale(JSON.parse(JSON.stringify(selectedSale)));
        printReady = false;
      } catch (error) {
        console.error("error printing sale: ", error);
      }
    } else {
      printReady = true;
    }
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(sales);
    $$payload2.out += `<main class="page svelte-pe8xtc"><div class="table-wrapper list svelte-pe8xtc"><div class="table--month svelte-pe8xtc"><p class="title">Reportes</p> <div class="month svelte-pe8xtc"><button class="svelte-pe8xtc">-</button> <div class="text svelte-pe8xtc"><p class="title svelte-pe8xtc">${escape_html(monthName)}</p> <p class="year svelte-pe8xtc">${escape_html(selectedYear)}</p></div> <button class="svelte-pe8xtc">+</button></div></div> <div class="table svelte-pe8xtc"><div class="table--header svelte-pe8xtc"><p class="date svelte-pe8xtc">fecha</p> <p class="number svelte-pe8xtc">importe</p> <p class="number svelte-pe8xtc">desc.</p> <p class="number short svelte-pe8xtc">tickets</p> <p class="number short svelte-pe8xtc">canc.</p> <p class="number svelte-pe8xtc">tarjeta</p> <p class="number svelte-pe8xtc">efectivo</p></div> <ul class="table--body"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let sale = each_array[$$index];
      $$payload2.out += `<li class="table--item svelte-pe8xtc"><button class="svelte-pe8xtc"><p class="date svelte-pe8xtc">${escape_html(new Date(sale.date).toLocaleDateString("en-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      }))}</p> <p class="number svelte-pe8xtc">${escape_html(sale.net_sales)}</p> <p class="number svelte-pe8xtc">${escape_html(sale.discount_amount)}</p> <p class="number short svelte-pe8xtc">${escape_html(sale.ticket_count)}</p> <p class="number short svelte-pe8xtc">${escape_html(sale.canceled_count)}</p> <p class="number svelte-pe8xtc">${escape_html(sale.card)}</p> <p class="number svelte-pe8xtc">${escape_html(sale.cash)}</p></button></li>`;
    }
    $$payload2.out += `<!--]--></ul></div></div> <div class="table-wrapper details svelte-pe8xtc">`;
    if (selectedSale.id) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<p class="title">${escape_html(new Date(selectedSale.date).toLocaleDateString("en-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      }))}</p> <div class="table svelte-pe8xtc"><div class="table--header svelte-pe8xtc"><p class="text svelte-pe8xtc">producto</p> <p class="svelte-pe8xtc">cantidad</p> <p class="svelte-pe8xtc">importe</p> <p class="svelte-pe8xtc">desc</p> <p class="svelte-pe8xtc">p. prom</p></div> <ul class="table--body svelte-pe8xtc">`;
      if (selectedSale.id) {
        $$payload2.out += "<!--[-->";
        const each_array_1 = ensure_array_like(selectedSale.daily_sales_details);
        $$payload2.out += `<!--[-->`;
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let item = each_array_1[$$index_1];
          $$payload2.out += `<li class="table--item svelte-pe8xtc"><p class="text svelte-pe8xtc">${escape_html(item.product.name)}</p> <p class="number short svelte-pe8xtc">${escape_html(item.quantity)}</p> <p class="number svelte-pe8xtc">${escape_html(item.net_sales)}</p> <p class="number svelte-pe8xtc">${escape_html(item.discount_amount)}</p> <p class="number svelte-pe8xtc">${escape_html(item.av_price)}</p></li>`;
        }
        $$payload2.out += `<!--]-->`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--></ul> <div class="buttonRow svelte-pe8xtc">`;
      ActionButton($$payload2, {
        action: printSale,
        imgSrc: printIcon,
        imgAlt: "imprimir",
        readyImg: confirmIcon,
        readyAlt: "confirmar",
        flexBasis: "50%",
        get ready() {
          return printReady;
        },
        set ready($$value) {
          printReady = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      ActionButton($$payload2, {
        action: () => exportSale(selectedSale.id),
        imgSrc: downloadIcon,
        imgAlt: "exportar",
        readyImg: confirmIcon,
        readyAlt: "confirmar",
        flexBasis: "50%",
        get ready() {
          return exportReady;
        },
        set ready($$value) {
          exportReady = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----></div></div>`;
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
//# sourceMappingURL=_page.svelte-8m8qEhUW.js.map
