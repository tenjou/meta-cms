import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"
import SchemaService from "../service/SchemaService"
import PopupService from "../service/PopupService"
import TextInput from "./TextInput"
import Select from "./Select"
import Word from "./Word"

const SchemaItem = component({
    state: {
        value: null,
        schema: null
    },

    mount() {
        this.handleChangeFunc = this.handleChange.bind(this)
        this.propsRemove = { onclick: this.handleRemove.bind(this) }
    },

    render() {
        elementOpen("item")
            elementOpen("field")
                componentVoid(Word, {
                    bind: `${this.bind.value}/key`,
                    $onchange: this.handleChangeFunc
                })
            elementClose("field")

            elementOpen("field")
                componentVoid(Select, { 
                    bind: {
                        value: `${this.bind.value}/type`,
                        src: "column-types" 
                    }
                })
            elementClose("field")

            elementOpen("field")
                this.renderValue()
            elementClose("field")
            
            elementOpen("button", this.propsRemove)
                text("Remove")
            elementClose("button")
        elementClose("item")
    },

    renderValue() {

    },

    handleChange(value) {
        if(SchemaService.isKeyUnique(this.$schema, value)) {
            return value
        }
        return this.$value.key
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
                    componentVoid(SchemaItem, { 
                        bind: {
                            value: `${this.bind.buffer}/${n}`,
                            schema: `asset/${this.$value.id}/meta/schema`
                        } 
                    })
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
        SchemaService.create(this.$value.id, this.$value.data)
        PopupService.closePopup()
    }
})

export default Schema