import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const NumberInput = component({
    mount() {
        this.props = { type: "number", onchange: this.handleChange.bind(this) }
    },

    render() {
        const element = elementVoid("input", this.props).element
        element.value = this.$value
    },

    handleChange(event) {
        this.$value = event.srcElement.value
    }
})

export default NumberInput