import { store } from "wabi"

class RenameAssetCommand {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.prevName = null
    }

    execute() {
        this.prevName = store.get(`asset/${this.id}/name`)
        store.set(`asset/${this.id}/name`, this.name)
    }

    undo() {
        store.set(`asset/${this.id}/name`, this.prevName)
    }
}

export default RenameAssetCommand