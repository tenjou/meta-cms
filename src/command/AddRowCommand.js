import { store } from "wabi"

class AddRowCommand {
    constructor(path, data) {
        this.path = path
        this.data = data
    }

    execute() {
        store.add(this.path, this.data)
    }

    undo() {
        const data = store.get(this.path)
        data.pop()
        store.update(this.path)
    }
}

export default AddRowCommand