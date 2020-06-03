import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const NumberInput = component({
    state: {
        value: 0,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER
    },

    mount() {
        this.handleChangeFunc = this.handleChange.bind(this)
    },

    render() {
        const element = elementVoid("input", {
            type: "Number",
            min: this.$min,
            max: this.$max,
            onchange: this.handleChangeFunc,
        })
        element.value = this.$value
    },

    handleChange(event) {
        this.$value = parseInt(event.srcElement.value)
    }
})

export default NumberInput