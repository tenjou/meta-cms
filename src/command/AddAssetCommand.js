import { store } from "wabi"
import SchemaService from "../service/SchemaService"

class AddAssetCommand {
    constructor(asset) {
        this.asset = asset
    }

    execute() {
        store.set(`assets/${this.asset.meta.id}`, this.asset)
        SchemaService.loadBuffer(this.asset)
    }

    undo() {
        store.remove(`assets/${this.asset.meta.id}`)
        SchemaService.unloadBuffer(this.asset)
    }
}

export default AddAssetCommand