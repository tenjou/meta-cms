import { store } from "wabi"

class AddAssetCommand {
    constructor(asset) {
        this.asset = asset
    }

    execute() {
        store.set(`data/${this.asset.meta.id}`, this.asset)
    }

    undo() {
        store.remove(`data/${this.asset.meta.id}`)
    }
}

export default AddAssetCommand