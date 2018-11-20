import { store } from "wabi"
import SchemaService from "../service/SchemaService"

class AddRowCommand {
    constructor(asset, data) {
        this.asset = asset
        this.data = data
    }

    execute() {
        store.add(`assets/${this.asset.meta.id}/data`, this.data)
        SchemaService.updateBuffer(this.asset)
    }

    undo() {
        const index = this.asset.data.indexOf(this.data)
        if(index !== -1) {
            this.asset.data.splice(index, 1)
            store.update(`assets/${this.asset.meta.id}/data`)
            SchemaService.updateBuffer(this.asset)
        }
    }
}

export default AddRowCommand