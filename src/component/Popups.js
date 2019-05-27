import { component, componentVoid, elementOpen, elementClose, text, elementVoid } from "wabi"
import PopupService from "../service/PopupService"

const Popups = component({
	mount() {
		this.bind = "state/popup"
		this.handleCloseFunc = this.handleClose.bind(this)
	},

	render() {
		const popup = this.$value
		if(popup) {
			elementOpen("back")
				elementOpen("window")
					elementOpen("header")
						elementOpen("name")
							text(popup.title)
						elementClose("name")

						elementOpen("button", { onclick: this.handleCloseFunc })
							elementVoid("i", { class: "fas fa-times" })
						elementClose("button")
					elementClose("header")

					elementOpen("content")
						popup.renderFunc()
					elementClose("content")
				elementClose("window")
			elementClose("back")	
		}
	},

	handleClose(event) {
		PopupService.closePopup()
	}
})

export default Popups