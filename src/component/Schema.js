import { component, componentVoid, elementOpen, elementClose, text, store } from "wabi"

const Schema = component({
    render() {
        elementOpen("schema")
        elementClose("schema")
    }
})

export default Schema