import { store } from "wabi"
import SchemaService from "../service/SchemaService"

class AddRowCommand {
    constructor(path, data) {
        this.path = path
        this.data = data
    }

    execute() {
        store.add(this.path, this.data)
        SchemaService.updateBuffer(this.asset)
    }

    undo() {
        const asset = store.get(this.path)
        const index = asset.indexOf(this.data)
        if(index !== -1) {
            this.asset.splice(index, 1)
            store.update(this.path)
            SchemaService.updateBuffer(asset)
        }
    }
}

export default AddRowCommand