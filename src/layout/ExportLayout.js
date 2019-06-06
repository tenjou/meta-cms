import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import ExportService from "../service/ExportService"
import Menu from "../component/Menu"
import Popups from "../component/Popups"
import Checkbox from "../component/Checkbox"

const ExportLayout = component({
	mount() {
		this.bind = "cache/export"
	},

	render() {
		const data = ExportService.create(this.$value)

		elementOpen("layout")
			componentVoid(Menu)
				elementOpen("export")
					elementOpen("toolbar")
						elementOpen("list")
							this.renderCheckbox("minify")
							this.renderCheckbox("production")
							if(this.$value.production) {
								this.renderCheckbox("named")
							}
						elementClose("list")
					elementClose("toolbar")

					elementOpen("content")
						elementOpen("pre")
							text(data)
						elementClose("pre")
					elementClose("content")
				elementClose("export")
		elementClose("layout")

		componentVoid(Popups)
	},

	renderCheckbox(key) {
		elementOpen("item")
			elementOpen("key")
				text(key)
			elementClose("key")

			elementOpen("value")
				componentVoid(Checkbox, { bind: `${this.bind}/${key}` })
			elementClose("value")
		elementClose("item")
	}
})

export default ExportLayout