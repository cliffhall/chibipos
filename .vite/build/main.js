"use strict";
const require$$3$1 = require("electron");
const promises = require("fs/promises");
const path$1 = require("node:path");
const path = require("path");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$3 = require("fs");
const require$$4 = require("net");
require("wait-on");
const escpos = require("escpos");
const escposNetwork = require("escpos-network");
const escposUSB = require("escpos-usb");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var src = { exports: {} };
var browser = { exports: {} };
var debug = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    if (ms2 >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (ms2 >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (ms2 >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (ms2 >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    return plural(ms2, d, "day") || plural(ms2, h, "hour") || plural(ms2, m, "minute") || plural(ms2, s, "second") || ms2 + " ms";
  }
  function plural(ms2, n, name) {
    if (ms2 < n) {
      return;
    }
    if (ms2 < n * 1.5) {
      return Math.floor(ms2 / n) + " " + name;
    }
    return Math.ceil(ms2 / n) + " " + name + "s";
  }
  return ms;
}
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug.exports;
  hasRequiredDebug = 1;
  (function(module, exports) {
    exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = requireMs();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports.colors[Math.abs(hash) % exports.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports.formatArgs.call(self, args);
        var logFn = debug2.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      debug2.namespace = namespace;
      debug2.enabled = exports.enabled(namespace);
      debug2.useColors = exports.useColors();
      debug2.color = selectColor(namespace);
      if ("function" === typeof exports.init) {
        exports.init(debug2);
      }
      return debug2;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  })(debug, debug.exports);
  return debug.exports;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports) {
    exports = module.exports = requireDebug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports) {
    var tty = require$$0;
    var util = require$$1;
    exports = module.exports = requireDebug();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs = require$$3;
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4;
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    exports.enable(load());
  })(node, node.exports);
  return node.exports;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src.exports;
  hasRequiredSrc = 1;
  if (typeof process !== "undefined" && process.type === "renderer") {
    src.exports = requireBrowser();
  } else {
    src.exports = requireNode();
  }
  return src.exports;
}
var electronSquirrelStartup;
var hasRequiredElectronSquirrelStartup;
function requireElectronSquirrelStartup() {
  if (hasRequiredElectronSquirrelStartup) return electronSquirrelStartup;
  hasRequiredElectronSquirrelStartup = 1;
  var path$12 = path;
  var spawn = require$$1$1.spawn;
  var debug2 = requireSrc()("electron-squirrel-startup");
  var app = require$$3$1.app;
  var run = function(args, done) {
    var updateExe = path$12.resolve(path$12.dirname(process.execPath), "..", "Update.exe");
    debug2("Spawning `%s` with args `%s`", updateExe, args);
    spawn(updateExe, args, {
      detached: true
    }).on("close", done);
  };
  var check = function() {
    if (process.platform === "win32") {
      var cmd = process.argv[1];
      debug2("processing squirrel command `%s`", cmd);
      var target = path$12.basename(process.execPath);
      if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
        run(["--createShortcut=" + target], app.quit);
        return true;
      }
      if (cmd === "--squirrel-uninstall") {
        run(["--removeShortcut=" + target], app.quit);
        return true;
      }
      if (cmd === "--squirrel-obsolete") {
        app.quit();
        return true;
      }
    }
    return false;
  };
  electronSquirrelStartup = check();
  return electronSquirrelStartup;
}
var electronSquirrelStartupExports = requireElectronSquirrelStartup();
const started = /* @__PURE__ */ getDefaultExportFromCjs(electronSquirrelStartupExports);
escpos.USB = escposUSB;
escpos.Network = escposNetwork;
async function printTicket(event, data) {
  const logoPath = path.resolve(__dirname, "../../static/img/chibi_logo-print.png");
  const { ticket, details, printerIP } = data;
  const time = new Date(ticket.date).toLocaleTimeString();
  const date = new Date(ticket.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const timeRowPadding = 32 - time.length - date.length;
  const minRows = 6;
  const detailPaddingRows = details.length >= minRows ? 0 : (minRows - details.length) * 2;
  const order = 320;
  const totalText = "TOTAL:";
  const totalAmount = `$${ticket.total_amount.toFixed(2)}`;
  const totalRowPadding = 32 - totalAmount.length - totalText.length;
  const discountRate = `-${Number(ticket.discount_rate * 100)}%`;
  const discountAmount = `-$${ticket.discount_amount.toFixed(2)}`;
  const subtotalAmount = `$${ticket.subtotal.toFixed(2)}`;
  const cardAmount = `$${ticket.card.toFixed(2)}`;
  const cardLabel = "tarjeta:";
  const cardPadding = 48 - cardAmount.length - cardLabel.length;
  const receivedCashAmount = `$${ticket.cash_received.toFixed(2)}`;
  const cashLabel = "efectivo:";
  const cashPadding = 48 - receivedCashAmount.length - cashLabel.length;
  const changeAmount = `$${ticket.change.toFixed(2)}`;
  const changeLabel = "CAMBIO:";
  const changePadding = 32 - changeAmount.length - changeLabel.length;
  console.log("Resolved Image Path:", logoPath);
  try {
    let getPrinter = function() {
      const devices = escpos.USB.findPrinter();
      if (devices && devices.length > 0) {
        const device2 = new escpos.USB();
        return new escpos.Printer(device2);
      } else {
        const device2 = new escpos.Network(printerIP);
        return new escpos.Printer(device2);
      }
    };
    const printer = getPrinter();
    const image = await new Promise((resolve, reject) => {
      escpos.Image.load(logoPath, (img) => {
        if (!img) {
          reject(new Error("Failed to load image"));
        } else {
          resolve(img);
        }
      });
    });
    await new Promise((resolve, reject) => {
      device.open((deviceError) => {
        if (deviceError) {
          console.error("Printer error: ", deviceError);
          reject(new Error(`Printer error: ${deviceError.message}`));
        }
        resolve();
      });
    });
    await printer.align("CT").image(image, "d24");
    printer.feed(1).font("B").size(1, 1).align("LT").style("B").text(`Orden: ${order}`).text("-".repeat(32)).style("NORMAL").text(`${date}${" ".repeat(timeRowPadding)}${time}`).text("-".repeat(32)).feed(1);
    details.forEach((detail) => {
      printer.font("A").style("NORMAL").size(0, 0).lineSpace(45).tableCustom([
        { text: `${detail.quantity}  `, align: "RIGHT", width: 0.1 },
        { text: detail.product.name, align: "LEFT", width: 0.5 },
        { text: `$${detail.price}`, align: "RIGHT", width: 0.2 },
        { text: `$${detail.price * detail.quantity}`, align: "RIGHT", width: 0.2 }
      ]).feed(0);
    });
    for (let i = 0; i < detailPaddingRows; i++) {
      printer.feed(1);
    }
    printer.feed(1);
    printer.font("B").size(1, 1).text("-".repeat(32));
    if (ticket.discount_amount > 0) {
      printer.font("B").style("NORMAL").align("RT").size(1, 1).text(`${subtotalAmount}`).feed(1).text(`${discountRate}: ${discountAmount}`).feed(1);
    }
    printer.font("B").style("B").size(1, 1).text(`${totalText}${" ".repeat(totalRowPadding)}${totalAmount}`).text("-".repeat(32));
    if (ticket.cash > 0) {
      printer.style("NORMAL").font("A").size(0, 0).text(`${cardLabel}${" ".repeat(cardPadding)}${cardAmount}`).feed(1).text(`${cashLabel}${" ".repeat(cashPadding)}${receivedCashAmount}`).feed(1).style("B").font("B").size(1, 1).text(`${changeLabel}${" ".repeat(changePadding)}${changeAmount}`).feed(1);
    } else {
      printer.style("NORMAL").font("A").align("CT").size(0, 0).text("pago con tarjeta").feed(1);
    }
    const catWithEars = `
  /\\_/\\  
  (=^o^=)  
  (  __  )  
  `;
    printer.feed(2).align("CT").style("b").text(catWithEars);
    printer.font("A").size(0, 0).align("CT").style("NORMAL").text("arigato").feed(2).text("");
    await new Promise((resolve) => {
      printer.cut().close(() => {
        console.log("ticket print completed");
        resolve();
      });
    });
    return { success: true, message: "ticket print completed" };
  } catch (error) {
    console.error("Print failed: ", error);
    return { success: false, message: "Error imprimiendo" };
  }
}
escpos.Network = escposNetwork;
async function printKitchen(event, data) {
  const { ticket, details, printerIP } = data;
  const time = new Date(ticket.date).toLocaleTimeString();
  try {
    const device2 = new escpos.Network(printerIP);
    const printer = new escpos.Printer(device2);
    await new Promise((resolve, reject) => {
      device2.open((deviceError) => {
        if (deviceError) {
          console.error("Printer error:", deviceError);
          reject(new Error(`Printer error: ${deviceError.message}`));
          return;
        }
        resolve();
      });
    });
    printer.font("B").text("-".repeat(32)).font("A").size(1, 1).align("CT").text("COMANDA").font("B").text("-".repeat(32)).align("RT").size(2, 2).text(time).font("B").size(1, 1).text("-".repeat(32));
    details.forEach((item) => {
      if (item.quantity < 10) {
        item.quantity = "0" + item.quantity;
      }
      printer.font("A").align("LT").style("NORMAL").size(1, 1).lineSpace(45).text(`${item.quantity} | ${item.product.name}`).feed(1);
    });
    printer.font("B").size(1, 1).text("-".repeat(32)).feed(4);
    await new Promise((resolve) => {
      printer.cut().close(() => {
        console.log("Kitchen print completed.");
        resolve();
      });
    });
    return { success: true, message: "kitchen print completed" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
escpos.Network = escposNetwork;
async function printSale(event, data) {
  console.log("printSale");
  const logoPath = path.resolve(__dirname, "../../static/img/chibi_logo-print.png");
  console.log("data: ", data);
  const { sale, printerIP } = data;
  const {
    cash,
    card,
    total_sales,
    net_sales,
    average_ticket,
    ticket_count,
    canceled_count,
    discount_amount,
    date,
    id
  } = sale;
  const cashLabel = "efectivo:";
  const cashAmount = `$${cash.toFixed(2)}`;
  const cashPadding = 20 - cashAmount.length - cashLabel.length;
  const cardLabel = "tarjeta:";
  const cardAmount = `$${card.toFixed(2)}`;
  const cardPadding = 20 - cardAmount.length - cardLabel.length;
  `$${total_sales.toFixed(2)}`;
  `$${discount_amount.toFixed(2)}`;
  const ticketCountLabel = "transacciones:";
  const ticketCount = ticket_count.toString();
  const ticketCountPadding = 32 - ticketCountLabel.length - ticketCount.length;
  const cancelCountLabel = "cancelaciones:";
  const cancelCount = canceled_count.toString();
  const cancelCountPadding = 32 - cancelCountLabel.length - cancelCount.length;
  const netLabel = "TOTAL:";
  const netSales = `$${net_sales.toFixed(2)}`;
  const netSalesPadding = 20 - netSales.length - netLabel.length;
  const avTicketLabel = "ticket promedio:";
  const avTicket = `$${average_ticket.toFixed(2)}`;
  const avTicketPadding = 32 - avTicketLabel.length - avTicket.length;
  try {
    const device2 = new escpos.Network(printerIP);
    const printer = new escpos.Printer(device2);
    const image = await new Promise((resolve, reject) => {
      escpos.Image.load(logoPath, (img) => {
        if (!img) {
          reject(new Error("Failed to load image"));
        } else {
          resolve(img);
        }
      });
    });
    await new Promise((resolve, reject) => {
      device2.open((deviceError) => {
        if (deviceError) {
          console.error("Printer error: ", deviceError);
          reject(new Error(`Printer error: ${deviceError.message}`));
        }
        resolve();
      });
    });
    await printer.align("CT").image(image, "d24");
    printer.font("B").size(1, 1).text("-".repeat(32)).size(2, 2).text("CORTE DE CAJA").size(1, 1).text("-".repeat(32)).feed(1).size(2, 2).text(`${date}`).feed(1).align("lt").size(0, 0).font("a").text(`id: ${id}`).size(1, 1).font("b").text("-".repeat(32)).feed(1).size(2, 2).style("NORMAL").text(`${cashLabel}${" ".repeat(cashPadding)}${cashAmount}`).feed(2).text(`${cardLabel}${" ".repeat(cardPadding)}${cardAmount}`).feed(2).style("b").text(`${netLabel}${" ".repeat(netSalesPadding)}${netSales}`).feed(1).size(1, 1).text("-".repeat(32)).text(`${ticketCountLabel}${" ".repeat(ticketCountPadding)}${ticketCount}`).feed(1).text(`${cancelCountLabel}${" ".repeat(cancelCountPadding)}${cancelCount}`).feed(1).text(`${avTicketLabel}${" ".repeat(avTicketPadding)}${avTicket}`).text("-".repeat(32)).size(0, 0).feed(1).font("A").align("CT").text(`cr: ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES")}`).feed(4);
    await new Promise((resolve) => {
      printer.cut().close(() => {
        resolve();
      });
    });
    return { success: true, message: "sale print completed" };
  } catch (error) {
    console.error("Print failed: ", error);
    return { success: false, message: error.message };
  }
}
if (started) {
  require$$3$1.app.quit();
}
const isDev = process.env.NODE_ENV === "development" || !require$$3$1.app.isPackaged;
let mainWindow;
async function createWindow() {
  mainWindow = new require$$3$1.BrowserWindow({
    width: 1180,
    height: 713,
    resizable: isDev,
    // Allow resizing in dev for easier debugging
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js"),
      // Ensure this path is correct after build
      contextIsolation: true,
      // Recommended for security
      nodeIntegration: false
      // Recommended for security
    }
  });
  {
    console.log(`[Main Process] Attempting to load DEV URL: ${"http://localhost:5177"}`);
    mainWindow.loadURL("http://localhost:5177").then(() => {
      console.log(`[Main Process] Successfully initiated DEV load for: ${"http://localhost:5177"}`);
    }).catch((err) => {
      console.error(`[Main Process] FAILED to load DEV URL: ${"http://localhost:5177"}`, err);
    });
  }
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame) {
      console.error(`[Main Process WebContents] Main frame did-fail-load:
        URL: ${validatedURL}
        Error Code: ${errorCode}
        Description: ${errorDescription}`);
    }
  });
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
  return mainWindow;
}
require$$3$1.app.whenReady().then(async () => {
  await createWindow();
  require$$3$1.app.on("activate", () => {
    if (require$$3$1.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
require$$3$1.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$3$1.app.quit();
  }
});
require$$3$1.app.on("before-quit", () => {
});
async function openMenuDialog(browserWindow) {
  const result = await require$$3$1.dialog.showOpenDialog(browserWindow, {
    // Pass browserWindow as first arg for parent
    properties: ["openFile"],
    filters: [{ name: "json file", extensions: ["json"] }]
  });
  if (result.canceled || result.filePaths.length === 0) return;
  const [filePath] = result.filePaths;
  try {
    const content = await promises.readFile(filePath, { encoding: "utf-8" });
    browserWindow.webContents.send("menu-file-opened", content);
  } catch (error) {
    console.error(`[Main Process] Error reading menu file ${filePath}:`, error);
    require$$3$1.dialog.showErrorBox("File Error", `Could not read the menu file: ${error.message}`);
  }
}
require$$3$1.ipcMain.on("open-menu-dialog", (event) => {
  const browserWindow = require$$3$1.BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) {
    console.warn("[Main Process] open-menu-dialog: Could not find BrowserWindow from sender.");
    return;
  }
  openMenuDialog(browserWindow);
});
require$$3$1.ipcMain.handle("print-ticket", async (e, data) => {
  console.log("[Main Process] Handling print-ticket IPC call.");
  const result = await printTicket(e, data);
  return result;
});
require$$3$1.ipcMain.handle("print-kitchen", async (e, data) => {
  console.log("[Main Process] Handling print-kitchen IPC call.");
  const result = await printKitchen(e, data);
  return result;
});
require$$3$1.ipcMain.handle("print-sale", async (e, data) => {
  console.log("[Main Process] Handling print-sale IPC call.");
  const result = await printSale(e, data);
  return result;
});
const menuTemplate = [
  {
    label: "Chibi POS",
    // On macOS this will be the app name, on others it's a menu item
    submenu: [
      {
        label: "Importar carta",
        click: () => {
          const focusedWindow = require$$3$1.BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            openMenuDialog(focusedWindow);
          } else {
            console.warn("[Main Process] Importar carta: No focused window to open dialog for.");
            if (mainWindow) openMenuDialog(mainWindow);
          }
        }
      },
      { type: "separator" },
      { label: "Recargar", role: "reload" },
      { label: "Forzar Recarga", role: "forceReload" },
      // Added for cache-busting reload
      { label: "Alternar Herramientas de Desarrollo", role: "toggleDevTools" },
      // Added for easy DevTools access
      { type: "separator" },
      { label: "Minimizar", role: "minimize" },
      { type: "separator" },
      { label: "Salir", role: "quit" }
    ]
  },
  // You can add an "Edit" menu for copy/paste, especially useful on macOS
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" }
    ]
  }
];
if (process.platform === "darwin") {
  menuTemplate.unshift({
    label: require$$3$1.app.getName(),
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" }
    ]
  });
}
const menu = require$$3$1.Menu.buildFromTemplate(menuTemplate);
require$$3$1.Menu.setApplicationMenu(menu);
