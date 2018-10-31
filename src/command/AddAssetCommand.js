import { store } from "wabi"

class AddAssetCommand {
    constructor(asset) {
        this.asset = asset
    }

    execute() {
        store.set(`asset/${this.asset.meta.id}`, this.asset)
    }

    undo() {
        store.remove(`asset/${this.asset.meta.id}`)
    }
}

export default AddAssetCommand