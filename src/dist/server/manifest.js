const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","img/products/archi.avif","img/products/brocheta.avif","img/products/california.avif","img/products/camara.avif","img/products/chirashi.avif","img/products/chorero.avif","img/products/dragon.avif","img/products/filadelfia.avif","img/products/furioso.avif","img/products/godzilla.avif","img/products/gohan_especial.avif","img/products/gohan_teriyaki.avif","img/products/maki.avif","img/products/manchego.avif","img/products/marlin.avif","img/products/mirrey.avif","img/products/panita.avif","img/products/pops.avif","img/products/terminator.avif","img/products/vegan.avif"]),
	mimeTypes: {".png":"image/png",".avif":"image/avif"},
	_: {
		client: {start:"_app/immutable/entry/start.DruQbqLB.js",app:"_app/immutable/entry/app.BABVRNMY.js",imports:["_app/immutable/entry/start.DruQbqLB.js","_app/immutable/chunks/Cw3-Dsd9.js","_app/immutable/chunks/CpheGI1x.js","_app/immutable/chunks/iHDSuM_z.js","_app/immutable/entry/app.BABVRNMY.js","_app/immutable/chunks/CpheGI1x.js","_app/immutable/chunks/cdZpXTRU.js","_app/immutable/chunks/lS090TL_.js","_app/immutable/chunks/iHDSuM_z.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-B8-1CtrE.js')),
			__memo(() => import('./chunks/1-GB9WffyY.js')),
			__memo(() => import('./chunks/2-D6VpwJwb.js')),
			__memo(() => import('./chunks/3-DuSexYIQ.js')),
			__memo(() => import('./chunks/4-o-dyHsCH.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/catProduct",
				pattern: /^\/api\/catProduct\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-C_FPhPup.js'))
			},
			{
				id: "/api/product",
				pattern: /^\/api\/product\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-DiGXox8r.js'))
			},
			{
				id: "/api/sale",
				pattern: /^\/api\/sale\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BohU-q2G.js'))
			},
			{
				id: "/api/sale/export",
				pattern: /^\/api\/sale\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CWKxXGsj.js'))
			},
			{
				id: "/api/sale/month",
				pattern: /^\/api\/sale\/month\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BW9B4_IO.js'))
			},
			{
				id: "/api/sale/[id]",
				pattern: /^\/api\/sale\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BMxMaCji.js'))
			},
			{
				id: "/api/ticket",
				pattern: /^\/api\/ticket\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-2kavG7km.js'))
			},
			{
				id: "/api/ticket/[id]",
				pattern: /^\/api\/ticket\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Itjx4VyL.js'))
			},
			{
				id: "/api/update-sales",
				pattern: /^\/api\/update-sales\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CMySrksN.js'))
			},
			{
				id: "/api/updateMenu",
				pattern: /^\/api\/updateMenu\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CcataWqr.js'))
			},
			{
				id: "/reportes",
				pattern: /^\/reportes\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/tickets",
				pattern: /^\/tickets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
