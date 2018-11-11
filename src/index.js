import { store, route } from "wabi"
import HomeLayout from "./layout/HomeLayout"
import ExportLayout from "./layout/ExportLayout"
import Commander from "./Commander"

const createMeta = () => {
	return {
		name: "Project",
		version: 1,
		created: Date.now()
	}
}

const assets = localStorage.getItem("assets")
if(assets) {
	store.set("assets", JSON.parse(assets))
	
	const meta = localStorage.getItem("meta")
	store.set("meta", meta ? JSON.parse(meta) : createMeta())

	const cache = localStorage.getItem("cache")
	store.set("cache", cache ? JSON.parse(cache) : {})
}
else {
	store.set("assets", {})
	store.set("cache", {})
	store.set("meta", createMeta())
}

store.set("state", {
	popup: null,
	menu: "",
	assetPrev: "",
	export: {
		minify: false
	}
})
store.set("column-types", [ "Id", "String", "Number", "Float", "Boolean", "UUID", "Reference" ])

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

route(/#asset\/([0-9a-z]*)/, HomeLayout, (data) => {
	store.set("state/menu", "")
	store.set("state/assetPrev", data[0][1])
	return { $value: data[0][1] }
})
route("#export", ExportLayout, () => {
	store.set("state/menu", "export")
})
route("/", HomeLayout, () => {
	document.location.hash = `#asset/${store.data.state.assetPrev}`
})

window.onbeforeunload = () => {
	localStorage.setItem("assets", JSON.stringify(store.data.assets))
	localStorage.setItem("cache", JSON.stringify(store.data.cache))
}

window.store = store