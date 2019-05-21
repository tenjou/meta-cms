import { component, componentVoid, elementOpen, elementClose, text, elementVoid } from "wabi"

const LoadingLayout = component({
	render() {
		elementOpen("layout", { class: "center" })
			elementOpen("loading")
				text("Loading")
			elementClose("loading")
		elementClose("layout")
	}
})

export default LoadingLayout