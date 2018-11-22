import { component, componentVoid, elementOpen, elementClose, text, store, elementVoid } from "wabi"

const FloatInput = component({
    state: {
        value: 0,
        step: 0.01,
        min: Number.MIN_VALUE,
        max: Number.MAX_VALUE
    },

    mount() {
        this.handleChangeFunc = this.handleChange.bind(this)
    },

    render() {
        const element = elementVoid("input", {
            type: "Number",
            min: this.$min,
            max: this.$max,
            step: this.$step,
            onchange: this.handleChangeFunc,
        }).element
        element.value = this.$value
    },

    handleChange(event) {
        this.$value = parseFloat(event.srcElement.value)
    }
})

export default FloatInput