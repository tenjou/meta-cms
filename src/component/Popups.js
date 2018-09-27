import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
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
				elementOpen("popup")
					elementOpen("header")
						elementOpen("title")
							text(popup.title)
						elementClose("title")

						elementOpen("button", { onclick: this.handleCloseFunc })
							text("close")
						elementClose("button")
					elementClose("header")

					elementOpen("content")
						componentVoid(popup.component, popup.props)
					elementClose("content")
				elementClose("popup")
			elementClose("back")	
		}
	},

	handleClose(event) {
		PopupService.closePopup()
	}
})

export default Popups