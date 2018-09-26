import { store } from "wabi"

class RenameAssetCommand {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.prevName = null
    }

    execute() {
        this.prevName = store.get(`data/${this.id}/name`)
        store.set(`data/${this.id}/name`, this.name)
    }

    undo() {
        store.set(`data/${this.id}/name`, this.prevName)
    }
}

export default RenameAssetCommand