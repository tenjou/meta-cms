import { store, route } from "wabi"
import HomeLayout from "./layout/HomeLayout"
import Commander from "./Commander"

import PopupService from "./service/PopupService"
import Schema from "./component/Schema"

store.set("", {
	meta: {

	},
	data: {
		"1234": {
			meta: {
				id: "1234",
				name: "Sheet",
				schema: {
					id: { type: "Id" },
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
	},
	cache: {

	},
	state: {
		popup: null
	}
})

PopupService.openPopup("Edit schema", Schema)

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

route("/", HomeLayout)
route(/#[0-9]*/, HomeLayout, (data) => {
	return { $value: location.hash.slice(1) }
})

window.store = store