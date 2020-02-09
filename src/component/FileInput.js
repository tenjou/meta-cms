import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const FileInput = component({
    mount() {
        this.props = { 
			type: "text", 
			readonly: true
		}
		this.propsButton = {
			class: "default black",
			onclick: this.handleClick.bind(this)
		}
		this.fileInput = null
    },

    render() {
		elementOpen("file-input")
			const element = elementVoid("input", this.props).element
			element.value = this.$value

			elementOpen("button", this.propsButton)
				elementVoid("i", { class: "fas fa-folder" })
			elementClose("button")
		elementClose("file-input")
	},
	
	handleClick(event) {
		const remote = require("electron").remote
		remote.dialog.showOpenDialog({
			properties: [ "openDirectory" ]
		}).then((result) => {
			const path = result.filePaths[0]
			if(path) {
				this.$value = path
			}
		})
	}
})

export default FileInput