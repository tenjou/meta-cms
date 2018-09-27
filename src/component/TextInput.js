import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const TextInput = component({
    mount() {
        this.props = { type: "text", onchange: this.handleChange.bind(this) }
    },

    render() {
        const element = elementVoid("input", this.props).element
        element.value = this.$value
    },

    handleChange(event) {
        this.$value = event.srcElement.value
    }
})

export default TextInput