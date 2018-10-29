import { store, route } from "wabi"
import HomeLayout from "./layout/HomeLayout"
import Commander from "./Commander"
import Utils from "./Utils"

store.set("meta", {})
store.set("data", {
	"1234": {
		meta: {
			id: "1234",
			name: "Sheet",
			schema: {
				id: { hash: Utils.uuid4(), type: "Id" },
				type: { hash: Utils.uuid4(), type: "String" }
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