import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"
import SchemaService from "../service/SchemaService"
import PopupService from "../service/PopupService"
import TextInput from "./TextInput"
import NumberInput from "./NumberInput"
import Select from "./Select"
import Checkbox from "./Checkbox"

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
        elementOpen("tr")
            elementOpen("td")
            elementClose("td")

            elementOpen("td")
                componentVoid(TextInput, { bind: `${this.bind.value}/key` })
            elementClose("td")

            elementOpen("td")
                componentVoid(Select, { 
                    bind: {
                        value: `${this.bind.value}/type`,
                        src: "column-types" 
                    }
                })
            elementClose("td")

            elementOpen("td")
                elementOpen("button", this.propsRemove)
                    text("Remove")
                elementClose("button")                        
            elementClose("td")
        elementClose("tr")
    },

    renderProperties() {
        switch(this.$value.type) {
            case "Number":
                this.renderProperty("Default value", NumberInput, { bind: `${this.bind.value}/default` })
                break

            case "String":
                this.renderProperty("Default value", TextInput, { bind: `${this.bind.value}/default` })
                break

            case "String":
                this.renderProperty("Default value", Checkbox, { bind: `${this.bind.value}/default` })
                break 
        }
    },

    renderProperty(type, component, props) {
        elementOpen("property")
            elementOpen("name")
                text(type)
            elementClose("name")

            elementOpen("value")
                componentVoid(component, props)
            elementClose("value")  
        elementClose("property")
    },

    handleChange(value) {
        if(SchemaService.isKeyUnique(this.$schema, value)) {
            return value
        }
        return this.$value.key
    },

    handleRemove(event) {
        store.remove(this.bind.value)
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
            elementOpen("buttons")
                elementOpen("button", { onclick: this.handleAddFunc })
                    text("Add Column")
                elementClose("button")
            elementClose("buttons")

            elementOpen("table")
                elementOpen("tr")
                    elementOpen("th")
                    elementClose("th")

                    elementOpen("th")
                        text("name")
                    elementClose("th")

                    elementOpen("th")
                        text("type")
                    elementClose("th")
                    
                    elementOpen("th")
                        text("actions")
                    elementClose("th")
                elementClose("tr")

                const buffer = this.$buffer
                for(let n = 0; n < buffer.length; n++) {
                    componentVoid(SchemaItem, { 
                        bind: {
                            value: `${this.bind.buffer}/${n}`,
                            schema: `assets/${this.$value.id}/meta/schema`
                        } 
                    })       
                }   
            elementClose("table")            

            elementOpen("buttons")
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