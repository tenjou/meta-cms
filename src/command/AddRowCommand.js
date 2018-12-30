import { store } from "wabi"
import SchemaService from "../service/SchemaService"

class AddRowCommand {
	constructor(path, data, root = false) {
		this.path = path
		this.data = data
		this.root = root
	}

	execute() {
		store.add(this.path, this.data)
		this.updateBuffer()
	}

	undo() {
		const asset = store.get(this.path)
		const index = asset.indexOf(this.data)
		if(index !== -1) {
			this.asset.splice(index, 1)
			store.update(this.path)
			this.updateBuffer()
		}
	}

	updateBuffer() {
		if(this.root) {
			const buffer = this.path.split("/")
			const assetPath = buffer.splice(0, buffer.length - 1).join("/")
			const asset = store.get(assetPath)				
			SchemaService.updateBuffer(asset)
		}
	}
}

export default AddRowCommand