import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const Checkbox = component({
    mount() {
        this.props = { type: "checkbox", onchange: this.handleChange.bind(this) }
    },

    render() {
        const element = elementVoid("input", this.props).element
        element.checked = this.$value
    },

    handleChange(event) {
        this.$value = event.srcElement.checked
    }
})

export default Checkbox