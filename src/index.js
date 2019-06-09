import { store, route, clearRoutes } from "wabi"
import ProjectLayout from "./layout/ProjectLayout"
import LoadingLayout from "./layout/LoadingLayout"
import HomeLayout from "./layout/HomeLayout"
import ExportLayout from "./layout/ExportLayout"
import SchemaService from "./service/SchemaService"
import ProjectService from "./service/ProjectService"
import FileSystem from "./fs/FileSystem"
import Commander from "./Commander"

// const createMeta = () => {
// 	return {
// 		name: "Project",
// 		version: 1,
// 		created: Date.now()
// 	}
// }

// const createCache = () => {
// 	return {
// 		assets: {
// 			selected: null
// 		},
// 		export: {
// 			minify: false,
// 			production: false,
// 			named: false
// 		}
// 	}
// }

// const assets = localStorage.getItem("assets")
// if(assets) {
// 	store.set("assets", JSON.parse(assets))
	
// 	const meta = localStorage.getItem("meta")
// 	store.set("meta", meta ? JSON.parse(meta) : createMeta())

// 	const cache = localStorage.getItem("cache")
// 	store.set("cache", cache ? JSON.parse(cache) : createCache())
// }
// else {
// 	store.set("assets", {})
// 	store.set("cache", createCache())
// 	store.set("meta", createMeta())
// }

store.set("buffers", {})

store.set("state", {
	popup: null,
	menu: "",
	project: {
		name: ""
	},
	cache: {
		export: {}
	}
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
	},
	Enum: {
		options: {
			type: "Enum"
		}
	}
})
store.set("column-types", Object.keys(store.data.types))
store.set("state", {
	project: {
		data: [],
		loading: false,
		create: null
	}
})

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


// route("/", HomeLayout, () => {
// 	const assetId = store.data.cache.assets.selected
// 	const asset = store.get(`assets/${assetId}`)
// 	if(asset) {
// 		document.location.hash = `#assets/${assetId}`
// 	}
// })
// 

const init = () => {
	route("", LoadingLayout, null, null, () => {
		FileSystem.init(() => {
			load()
		},
		(error) => {
			console.log(error)
		})
	})
}

const load = () => {
	clearRoutes()
	route(/\/#([0-9a-z]*)\/#export/, ExportLayout, (data) => {})		
	route(/\/#([0-9a-z]*)\/([0-9a-z]*)/, HomeLayout, (data) => {})		
	route(/\/#([0-9a-z]*)/, HomeLayout, (data) => {})	
	route("/", ProjectLayout, (data) => {
		ProjectService.unload()
	})

	ProjectService.load()

	// route(/#assets\/([0-9a-z]*)/, HomeLayout, (data) => {
	// 	const assetId = data[0][1]
	// 	const asset = store.get(`assets/${assetId}`)
	// 	if(!asset) {
	// 		document.location.hash = ""
	// 		return
	// 	}	// 	const asset = store.get(`assets/${assetId}`)
	// 	if(!asset) {
	// 		document.location.hash = ""
	// 		return
	// 	}
	// 	store.set("state/menu", "")
	// 	store.set("cache/assets/selected", assetId)
	// 	return { $value: data[0][1] }
	// })
	// route("#export", ExportLayout, () => {
	// 	store.set("state/menu", "export")
	// })

	window.onbeforeunload = () => {
		ProjectService.unload()
	}
	store.addProxy("", (payload) => {
		store.handle(payload)
		needSave = true
	})
}

init()

let needSave = false

setInterval(() => {
	if(needSave) {
		needSave = false
		ProjectService.save()
	}
}, 500)

window.store = store