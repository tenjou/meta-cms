import { component, elementOpen, elementClose, text, elementVoid, componentVoid } from "wabi"

const Loader = component({
	render() {
		const color = this.$value
		const props = { class: color ? color : "" }

		elementOpen("loader", props)
			elementVoid("div")
			elementVoid("div")
			elementVoid("div")
			elementVoid("div")
		elementClose("loader")		
	}
})

export default Loader