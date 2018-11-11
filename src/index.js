import { store, route } from "wabi"
import HomeLayout from "./layout/HomeLayout"
import ExportLayout from "./layout/ExportLayout"
import Commander from "./Commander"

const assets = localStorage.getItem("assets")
if(assets) {
	store.set("assets", JSON.parse(assets))

	const cache = localStorage.getItem("cache")
	if(cache) {
		store.set("cache", JSON.parse(cache))
	}
	else {
		store.set("cache", {})
	}
}
else {
	store.set("assets", {})
	store.set("cache", {})
}

store.set("meta", {})
store.set("state", {
	popup: null,
	menu: "",
	assetPrev: ""
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