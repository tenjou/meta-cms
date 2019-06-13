import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store, element } from "wabi"
import ProjectService from "../service/ProjectService"
import Utils from "../Utils"

const Menu = component({
	mount() {
		this.bind = "state/menu"
		this.propsUpload = { 
			type: "file", 
			style: "display: none;",
			onchange: handleChange
		}
	},

	render() {
		elementOpen("menu")
			const uploadElement = elementVoid("input", this.propsUpload).element

			this.renderItem("", "Home")
			this.renderAction("export", () => {
				location.hash = `${store.data.meta.id}/#export`
			})
			this.renderAction("Import", () => {
				uploadElement.click()
			})
		elementClose("menu")
	},

	renderItem(key, value) {
		const props = {
			class: (this.$value === key) ? "active" : "",
			href: `#${key}`
		}
		elementOpen("a", props)
			text(value)
		elementClose("a")
	},

	renderAction(value, onclick) {
		elementOpen("a", { onclick })
			text(value)
		elementClose("a")
	},
})

const handleChange = (event) => {
	const files = event.target.files
	const file = files[0]
	Utils.readFile(file, (json) => {
		ProjectService.importJson(json)
	})
	event.target.value = ""
}

export default Menu