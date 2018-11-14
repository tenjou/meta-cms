import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"

const Select = component({
    state: {
        value: null,
        src: null,
        onChange: null
    },

    mount() {
        this.props = { onchange: this.handleChange.bind(this) }
    },

    render() {
        const options = this.$src
        if(!this.$value) {
            this.$value = options[0]
        }

        elementOpen("select", this.props)
            for(let n = 0; n < options.length; n++) {
                const option = options[n]
                const props = (this.$value === option) ? { value: option, selected: true } : { value: option }
                elementOpen("option", props)
                    text(option)
                elementClose("option")
            }
        elementClose("select")
    },

    handleChange(event) {
        this.$value = event.srcElement.value
        if(this.$onChange) {
            this.$onChange(event.srcElement.value)
        }
    }
})

export default Select