import { store } from "wabi"
import SchemaService from "./SchemaService"
import AddRowCommand from "../command/AddRowCommand"
import AddAssetCommand from "../command/AddAssetCommand"
import RenameAssetCommand from "../command/RenameAssetCommand"
import RemoveAssetCommand from "../command/RemoveAssetCommand"
import Commander from "../Commander"
import Utils from "../Utils"

const add = (type, schema) => {
    const asset = create(type, schema)
    Commander.execute(new AddAssetCommand(asset))
}

const create = (type, schema = {}) => {
    const asset = {
        meta: {
            id: Utils.uuid4(),
            name: type,
            type,
            schema
        },
        data: []
    }
    return asset
}

const addSheet = () => {
    add("Sheet")
}

const addEnum = () => {
    add("Enum", {
        Key: { type: "String" },
        Value: { type: "Id" }
    })
}

const remove = (id) => {
    Commander.execute(new RemoveAssetCommand(id))
}

const edit = (id) => {

}

const addRow = (id) => {
    const asset = store.get(`assets/${id}`)
    const row = SchemaService.createRow(asset)
    Commander.execute(new AddRowCommand(`assets/${id}/data`, row))
}

const removeField = (id, path) => {

}

export { add, create, addSheet, addEnum, remove, edit, addRow }