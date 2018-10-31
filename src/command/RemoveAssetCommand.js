import { store } from "wabi"

class RemoveAssetCommand {
    constructor(id) {
        this.id = id
        this.asset = null
    }

    execute() {
        this.asset = store.get(`asset/${this.id}`)
        store.remove(`asset/${this.id}`)
    }

    undo() {
        store.set(`asset/${this.id}`, this.asset)
    }
}

export default RemoveAssetCommand