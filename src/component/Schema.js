import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"
import SchemaService from "../service/SchemaService"
import TextInput from "./TextInput"
import Select from "./Select"
import Word from "./Word"

const SchemaItem = component({
    mount() {
        this.handleChangeFunc = this.handleChange.bind(this)
        this.propsRemove = { onclick: this.handleRemove.bind(this) }
    },

    render() {
        elementOpen("item")
            elementOpen("field")
                componentVoid(Word, {
                    bind: `${this.bind}/key`,
                    $onchange: this.handleChangeFunc
                })
            elementClose("field")

            elementOpen("field")
                componentVoid(Select, { 
                    bind: {
                        value: `${this.bind}/type`,
                        src: "column-types" 
                    }
                })
            elementClose("field")
            
            elementOpen("button", this.propsRemove)
                text("Remove")
            elementClose("button")
        elementClose("item")
    },

    handleChange(value) {
        return value
    },

    handleRemove(event) {
        store.remove(this.bind)
    }
})

const Schema = component({
    state: {
        value: null,
        buffer: null
    },

    mount() {
        this.handleAddFunc = this.handleAdd.bind(this)
        this.handleApplyFunc = this.handleApply.bind(this)
    },

    render() {
        elementOpen("schema")
            elementOpen("list")
                const buffer = this.$buffer
                for(let n = 0; n < buffer.length; n++) {
                    componentVoid(SchemaItem, { bind: `${this.bind.buffer}/${n}` })
                }    
            elementClose("list")

            elementOpen("buttons")
                elementOpen("button", { onclick: this.handleAddFunc })
                    text("Add")
                elementClose("button")

                elementOpen("button", { onclick: this.handleApplyFunc })
                    text("Apply")
                elementClose("button")
            elementClose("buttons")
        elementClose("schema")
    },

    handleAdd(event) {
        store.add(this.bind.buffer, SchemaService.createItem(this.$value.data))
    },

    handleApply(event) {
        SchemaService.create(this.$value.id, this.$value.data, this.$value.schema)
    }
})

export default Schema