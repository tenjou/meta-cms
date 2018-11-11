import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import Menu from "../component/Menu"
import Popups from "../component/Popups"
import Checkbox from "../component/Checkbox"

const ExportLayout = component({
	mount() {
		this.bind = "state/export"
	},

	render() {
		const data = {
			meta: store.data.meta,
			assets: store.data.assets
		}

		elementOpen("layout")
			componentVoid(Menu)

				elementOpen("export")
					elementOpen("toolbar")
						elementOpen("list")
							elementOpen("item")
								elementOpen("key")
									text("Minify")
								elementClose("key")

								elementOpen("value")
									componentVoid(Checkbox, { bind: "state/export/minify" })
								elementClose("value")
							elementClose("item")
						elementClose("list")
					elementClose("toolbar")

					elementOpen("panel")
						elementOpen("pre")
							if(this.$value.minify) {
								text(JSON.stringify(data))
							}
							else {
								text(JSON.stringify(data, null, "\t"))
							}
						elementClose("pre")
					elementClose("panel")
				elementClose("export")
		elementClose("layout")

		componentVoid(Popups)
	}
})

export default ExportLayout