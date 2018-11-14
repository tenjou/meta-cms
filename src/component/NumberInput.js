import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const NumberInput = component({
    state: {
        value: 0,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER
    },

    mount() {
        this.props = { type: "number", onchange: this.handleChange.bind(this) }
    },

    render() {
        const element = elementVoid("input", {
            type: "Number",
            min: this.$min,
            max: this.$max,
            onchange: this.handleChange.bind(this),
        }).element
        element.value = this.$value
    },

    handleChange(event) {
        this.$value = event.srcElement.value
    }
})

export default NumberInput