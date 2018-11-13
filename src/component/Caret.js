import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const Caret = component({
	mount() {
		this.props = { onclick: this.handleChange.bind(this) }
	},

	render() {
		elementOpen("caret", props)
			if(this.$value) {
				elementVoid("i", { class: "fas fa-caret-down" })
			}
			else {
				elementVoid("i", { class: "fas fa-caret-right" })
			}
		elementClose("caret")
	},

	handleChange(event) {
		this.$value = event.srcElement.value
	}
})

export default Caret