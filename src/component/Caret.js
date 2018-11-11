import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const Caret = component({
	mount() {
		
	},

	render() {
		elementOpen("caret")
		elementClose("caret")
	},

	handleChange(event) {
		this.$value = event.srcElement.value
	}
})

export default Caret