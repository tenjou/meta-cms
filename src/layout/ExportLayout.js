import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import ExportService from "../service/ExportService"
import Menu from "../component/Menu"
import Popups from "../component/Popups"
import Checkbox from "../component/Checkbox"
import FileInput from "../component/FileInput"
import Utils from "../Utils"

const ExportLayout = component({
	mount() {
		this.bind = "cache/export"
		this.propsExport = { class: "default black", onclick: this.handleExport.bind(this) }
	},

	render() {
		const data = ExportService.create(this.$value)

		elementOpen("layout")
			componentVoid(Menu)
				elementOpen("export")
					elementOpen("toolbar")
						elementOpen("list")
							if(Utils.isElectron()) {
								this.renderComponent("directory", FileInput)
							}	
							this.renderComponent("minify", Checkbox)
							this.renderComponent("production", Checkbox)
							if(this.$value.production) {
								this.renderComponent("named", Checkbox)
							}
						elementClose("list")

						elementOpen("buttons")
							elementOpen("button", this.propsExport)
								text("Export")
							elementClose("button")		
						elementClose("buttons")				
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

	renderComponent(key, component) {
		elementOpen("item")
			elementOpen("key")
				text(key)
			elementClose("key")

			elementOpen("value")
				componentVoid(component, { bind: `${this.bind}/${key}` })
			elementClose("value")
		elementClose("item")
	},

	handleExport(event) {
		ExportService.exportData()
		history.back()
	}
})

export default ExportLayout