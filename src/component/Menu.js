import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"

const Menu = component({
	mount() {
		this.bind = "state/menu"
	},

	render() {
		elementOpen("menu")
			this.renderItem("", "Home")
			this.renderItem("export", "Export")
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
	}
})

export default Menu