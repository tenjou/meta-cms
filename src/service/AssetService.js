import { store } from "wabi"
import AddRowCommand from "../command/AddRowCommand"
import AddAssetCommand from "../command/AddAssetCommand"
import RenameAssetCommand from "../command/RenameAssetCommand"
import RemoveAssetCommand from "../command/RemoveAssetCommand"
import Commander from "../Commander"
import Utils from "../Utils"

const add = (type) => {
    const asset = create(type)
    Commander.execute(new AddAssetCommand(asset))
}

const create = (type) => {
    const asset = {
        meta: {
            id: Utils.uuid4(),
            name: type,
            schema: {}
        },
        data: []
    }
    return asset
}

const remove = (id) => {
    Commander.execute(new RemoveAssetCommand(id))
}

const edit = (id) => {

}

const addRow = (id) => {
    const data = {}
    const schema = store.get(`data/${id}/meta/schema`)
    for(let key in schema) {
        const schemaItem = schema[key]
        switch(schemaItem.type) {
            case "Id":
                data[key] = Utils.uuid4()
                break
            case "String":
                data[key] = "foo_bar"
                break
        }
    }
    Commander.execute(new AddRowCommand(`data/${id}/data`, data))
}

const removeField = (id, path) => {

}

export { add, create, remove, edit, addRow }