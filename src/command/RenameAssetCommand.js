import { store } from "wabi"

class RenameAssetCommand {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.prevName = null
    }

    execute() {
        this.prevName = store.get(`assets/${this.id}/name`)
        store.set(`assets/${this.id}/name`, this.name)
    }

    undo() {
        store.set(`assets/${this.id}/name`, this.prevName)
    }
}

export default RenameAssetCommand