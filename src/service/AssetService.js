import { store } from "wabi"
import SchemaService from "./SchemaService"
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
    const schema = store.get(`asset/${id}/meta/schema`)
    const row = SchemaService.createRow(schema)
    Commander.execute(new AddRowCommand(`asset/${id}/data`, row))
}

const removeField = (id, path) => {

}

export { add, create, remove, edit, addRow }