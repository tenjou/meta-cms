import { store } from "wabi"
import SchemaService from "../service/SchemaService"

class RemoveRowCommand {
    constructor(path, data) {
        this.path = path
        this.data = data
    }

    execute() {
        const asset = store.get(this.path)
        const index = asset.indexOf(this.data)
        if(index !== -1) {
            asset.splice(index, 1)
            store.update(this.path)
            // SchemaService.updateBuffer(asset)
        }
    }

    undo() {
        const asset = store.get(this.path)
        store.add(this.assetPath, this.data)
        // SchemaService.updateBuffer(asset)
    }
}

export default RemoveRowCommand