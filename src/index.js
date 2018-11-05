import { store, route } from "wabi"
import HomeLayout from "./layout/HomeLayout"
import Commander from "./Commander"

store.set("meta", {})
store.set("asset", {
	"1234": {
		meta: {
			id: "1234",
			name: "Sheet",
			type: "Sheet",
			schema: {
				id: { type: "UUID" },
				type: { type: "String" }
			}
		},
		data: [
			{ id: 1, type: "foo0" },
			{ id: 1, type: "foo1" },
			{ id: 1, type: "foo2" },
			{ id: 1, type: "foo3" },
			{ id: 1, type: "foo4" },
		]
	}
})
store.set("cache", {})
store.set("state", {
	popup: null
})
store.set("column-types", [ "String", "Number", "Boolean", "Id", "UUID" ])

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

route(/\/#[0-9]*/, HomeLayout, (data) => {
	return { $value: location.hash.slice(1) }
})
route("/", HomeLayout)

window.store = store