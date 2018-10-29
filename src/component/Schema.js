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
        data: null
    },

    mount() {
        this.handleAddFunc = this.handleAdd.bind(this)
        this.handleApplyFunc = this.handleApply.bind(this)
    },

    render() {
        const data = this.$data

        elementOpen("schema")
            elementOpen("list")
                for(let n = 0; n < data.length; n++) {
                    componentVoid(SchemaItem, { bind: `${this.bind.data}/${n}` })
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
        this.$value.data.push(SchemaService.createItem(this.$value.data))
        this.updateAll()
    },

    handleApply(event) {
        const value = this.$value
        SchemaService.create(value.data, value.dataPrev, value.hashes, value.schema)
    }
})

export default Schema