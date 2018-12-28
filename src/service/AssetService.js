import { store } from "wabi"
import SchemaService from "./SchemaService"
import AddRowCommand from "../command/AddRowCommand"
import AddAssetCommand from "../command/AddAssetCommand"
import RenameAssetCommand from "../command/RenameAssetCommand"
import RemoveAssetCommand from "../command/RemoveAssetCommand"
import Commander from "../Commander"
import Utils from "../Utils"

const tryAdd = (type, schema) => {
    const asset = create(type, schema)
    Commander.execute(new AddAssetCommand(asset))
}

const tryRemove = (id) => {
    Commander.execute(new RemoveAssetCommand(id))
    if(store.data.cache.assets.selected === id) {
        document.location.hash = ""
    }
}

const create = (type, schema) => {
    if(!schema) {
        schema = SchemaService.createSchema()
    }
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

const createSheet = () => {
    tryAdd("Sheet")
}

const edit = (id) => {

}

const addRow = (id) => {
    const assetPath = `assets/${id}`
    const asset = store.get(assetPath)
    const row = SchemaService.createRow(asset.data, asset.meta.schema)
    Commander.execute(new AddRowCommand(`${assetPath}/data`, row))
}

export { tryAdd, create, createSheet, tryRemove, edit, addRow }