import { store } from "wabi"
import SchemaService from "./SchemaService"

const load = (json) => {
    try {
        const data = JSON.parse(json)
        // store.set("meta", data.meta)
        // store.set("assets", data.assets)
    }
    catch(error) {
        console.error(error)
    }
}

export { load }