import { store } from "wabi"
import SchemaService from "../service/SchemaService"

class RemoveRowCommand {
    constructor(path, data) {
        this.asset = store.get(path)
        this.data = data
    }

    execute() {
        const index = this.asset.data.indexOf(this.data)
        if(index !== -1) {
            this.asset.data.splice(index, 1)
            store.update(`assets/${this.asset.meta.id}/data`)
            SchemaService.updateBuffer(this.asset)
        }
    }

    undo() {
        store.add(`assets/${this.asset.meta.id}/data`, this.data)
        SchemaService.updateBuffer(this.asset)
    }
}

export default RemoveRowCommand