import { store } from "wabi"

class RemoveAssetCommand {
    constructor(id) {
        this.id = id
        this.asset = null
    }

    execute() {
        this.asset = store.get(`assets/${this.id}`)
        store.remove(`assets/${this.id}`)
    }

    undo() {
        store.set(`assets/${this.id}`, this.asset)
    }
}

export default RemoveAssetCommand