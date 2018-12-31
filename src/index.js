import { store, route } from "wabi"
import HomeLayout from "./layout/HomeLayout"
import ExportLayout from "./layout/ExportLayout"
import SchemaService from "./service/SchemaService"
import Commander from "./Commander"

const createMeta = () => {
	return {
		name: "Project",
		version: 1,
		created: Date.now()
	}
}

const createCache = () => {
	return {
		assets: {
			selected: null
		},
		export: {
			minify: false,
			production: false,
			named: false
		}
	}
}

const assets = localStorage.getItem("assets")
if(assets) {
	store.set("assets", JSON.parse(assets))
	
	const meta = localStorage.getItem("meta")
	store.set("meta", meta ? JSON.parse(meta) : createMeta())

	const cache = localStorage.getItem("cache")
	store.set("cache", cache ? JSON.parse(cache) : createCache())
}
else {
	store.set("assets", {})
	store.set("cache", createCache())
	store.set("meta", createMeta())
}

store.set("buffers", {})

const loadBuffers = () => {
	const assets = store.data.assets
	for(let key in assets) {
		const asset = assets[key]
		SchemaService.loadBuffer(asset)
	}
}

loadBuffers()

store.set("state", {
	popup: null,
	menu: ""
})

store.set("types", {
	UID: {},
	GUID: {},
	String: {
		default: {
			type: "String",
			value: "Key"
		}
	},
	Number: {
		default: {
			type: "Number",
			value: 0
		},
		min: {
			type: "Number",
			value: Number.MIN_SAFE_INTEGER
		},
		max: {
			type: "Number",
			value: Number.MAX_SAFE_INTEGER
		}
	},
	Float: {
		default: {
			type: "Number",
			value: 0.0
		},
		min: {
			type: "Number",
			value: Number.MIN_VALUE
		},
		max: {
			type: "Number",
			value: Number.MAX_VALUE
		},
		step: {
			type: "Number",
			value: 0.01
		}		
	},
	Boolean: {
		default: {
			type: "Boolean",
			value: false
		}
	},
	Reference: {
		sheet: {
			type: "Sheet"
		},
		default: {
			type: "Select",
			src: "buffers",
			lookup: "sheet"
		}		
	},
	Type: {
		schema: {
			type: "Type"
		}
	},
	List: {
		schema: {
			type: "Schema"
		}
	}
})
store.set("column-types", Object.keys(store.data.types))

window.addEventListener("keydown", (event) => {
	if(event.keyCode === 90 && event.ctrlKey) {
		if(event.shiftKey) {
			Commander.redo()
		}
		else {
			Commander.undo()
		}
	}
})

route(/#assets\/([0-9a-z]*)/, HomeLayout, (data) => {
	const assetId = data[0][1]
	const asset = store.get(`assets/${assetId}`)
	if(!asset) {
		document.location.hash = ""
		return
	}
	store.set("state/menu", "")
	store.set("cache/assets/selected", assetId)
	return { $value: data[0][1] }
})
route("#export", ExportLayout, () => {
	store.set("state/menu", "export")
})
route("/", HomeLayout, () => {
	const assetId = store.data.cache.assets.selected
	const asset = store.get(`assets/${assetId}`)
	if(asset) {
		document.location.hash = `#assets/${assetId}`
	}
})

window.onbeforeunload = () => {
	localStorage.setItem("meta", JSON.stringify(store.data.meta))
	localStorage.setItem("assets", JSON.stringify(store.data.assets))
	localStorage.setItem("cache", JSON.stringify(store.data.cache))
}

window.store = store