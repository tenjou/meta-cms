import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"
import SchemaService from "../service/SchemaService"
import TextInput from "./TextInput"
import Select from "./Select"

const SchemaItem = component({
    mount() {
        this.propsRemove = { onclick: this.handleRemove.bind(this) }
    },

    render() {
        elementOpen("item")
            elementOpen("field")
                elementOpen("name")
                    text("Name")
                elementClose("name")

                elementOpen("value")
                    componentVoid(TextInput, { bind: `${this.bind}/name` })
                elementClose("value")
            elementClose("field")

            elementOpen("field")
                elementOpen("name")
                    text("Type")
                elementClose("name")

                elementOpen("value")
                    componentVoid(Select, { 
                        bind: {
                            value: `${this.bind}/type`,
                            src: "column-types" 
                        }
                    })
                elementClose("value")
            elementClose("field")
            
            elementOpen("button", this.propsRemove)
                text("Remove")
            elementClose("button")
        elementClose("item")
    },

    handleRemove(event) {
        store.remove(this.bind)
    }
})

const Schema = component({
    mount() {
        store.set("state/popup/cache", [])
        this.bind = "state/popup/cache"
        this.handleAddFunc = this.handleAdd.bind(this)
    },

    render() {
        const schema = this.$value

        elementOpen("schema")
            elementOpen("list")
                for(let n = 0; n < schema.length; n++) {
                    componentVoid(SchemaItem, { bind: `state/popup/cache/${n}` })
                }    
            elementClose("list")

            elementOpen("buttons")
                elementOpen("button", { onclick: this.handleAddFunc })
                    text("Add")
                elementClose("button")

                elementOpen("button")
                    text("Apply")
                elementClose("button")                
            elementClose("buttons")
        elementClose("schema")
    },

    handleAdd(event) {
        this.$value.push({ name: "column", type: "String" })
        this.updateAll()
    }
})

export default Schema