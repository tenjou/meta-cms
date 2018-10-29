import { store } from "wabi"
import Utils from "../Utils"

store.set("column-types", [ "String", "Number", "Boolean", "Id" ])

const create = (data, dataPrev, hashes, schema) => {
    let itemsFromPrev = 0

    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        const itemPrev = hashes[item.hash]
        if(itemPrev !== undefined) {
            itemsFromPrev++
            if(item.key !== itemPrev.key) {
                console.log(`rename from: ${itemPrev.key} to: ${item.key}`)
            }
            if(item.index !== itemPrev.index) {
                console.log(`move position from: ${itemPrev.index} to: ${item.index}`)
            }
            if(item.type !== itemPrev.type) {
                console.log(`change type from: ${itemPrev.type} to: ${item.type}`)
            }
        }
        else {
            console.log(`add: ${item.key}`)
        }
    }

    if(itemsFromPrev !== dataPrev.length) {
        loop:
        for(let n = 0; n < dataPrev.length; n++) {
            const entry = dataPrev[n]
            for(let m = 0; m < data.length; m++) {
                const item = data[m]
                if(item.hash === entry.hash) {
                    continue loop
                }
            }
            console.log(`remove column: ${entry.key}`)
        }
    }
}

const createItem = (data) => {
    return { hash: Utils.uuid4(), key: "column", type: "String", index: data.length }
}

const prepareData = (schema) => {
    const result = []
    let index = 0
    for(let key in schema) {
        const entry = schema[key]
        result.push({ hash: entry.hash, key, type: entry.type, index }) 
        index++
    }
    return result
}

export { create, createItem, prepareData }