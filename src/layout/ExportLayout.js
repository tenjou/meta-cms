import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import Menu from "../component/Menu"
import Popups from "../component/Popups"

const ExportLayout = component({
    render() {
		elementOpen("layout")
			componentVoid(Menu)

			elementOpen("workspace")
				text("export")
			elementClose("workspace")
		elementClose("layout")

		componentVoid(Popups)
    }
})

export default ExportLayout