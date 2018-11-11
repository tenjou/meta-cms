import { store } from "wabi"

class AddAssetCommand {
    constructor(asset) {
        this.asset = asset
    }

    execute() {
        store.set(`assets/${this.asset.meta.id}`, this.asset)
    }

    undo() {
        store.remove(`assets/${this.asset.meta.id}`)
    }
}

export default AddAssetCommand