import { store } from "wabi"

class RemoveAssetCommand {
    constructor(id) {
        this.id = id
        this.asset = null
    }

    execute() {
        this.asset = store.get(`data/${this.id}`)
        store.remove(`data/${this.id}`)
    }

    undo() {
        store.set(`data/${this.id}`, this.asset)
    }
}

export default RemoveAssetCommand