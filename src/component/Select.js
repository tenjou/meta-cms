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

        elementOpen("select", this.props)
            if(options.length > 0) {
                const keyPair = (typeof options[0] === "object") ? true : false

                if(keyPair) {
                    if(!this.$value || (options.length === 1 && options[0] !== this.$value)) {
                        this.$value = options[0].value
                    }        

                    for(let n = 0; n < options.length; n++) {
                        const option = options[n]
                        const props = (this.$value === option.value) ? { value: option.value, selected: true } : { value: option.value }
                        elementOpen("option", props)
                            text(option.key)
                        elementClose("option")
                    }                    
                }
                else {
                    if(!this.$value || (options.length === 1 && options[0] !== this.$value)) {
                        this.$value = options[0]
                    }

                    for(let n = 0; n < options.length; n++) {
                        const option = options[n]
                        const props = (this.$value === option) ? { value: option, selected: true } : { value: option }
                        elementOpen("option", props)
                            text(option)
                        elementClose("option")
                    }                    
                }
            }
            else {
                this.$value = null
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