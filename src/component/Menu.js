import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store, element } from "wabi"
import ImportService from "../service/ImportService"
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
			this.renderItem("export", "Export")
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
		ImportService.load(json)
	})
	event.target.value = ""
}

export default Menu