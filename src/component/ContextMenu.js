import { component, componentVoid, elementOpen, elementClose, elementVoid, text } from "wabi"
import MenuService from "../service/MenuService"

const ContextMenuInner = component({
	render() {
		elementOpen("inner")
			const items = this.$value
			if(items.length === 0) {
				elementOpen("content", { class: "centered" })
					text("No items")
				elementClose("content")
			}
			else 
			{
				for(let n = 0; n < items.length; n++) {
					const item = items[n]
					if(item.type === "category") {
						this.renderCategory(item)
					}
					else if(item.children) {
						this.renderMenu(item)
					}
					else {
						this.renderItem(item)
					}
				}
			}
		elementClose("inner")
	},

	renderItem(item) {
		const attr = item.func ? { onclick: item.func } : null
		elementOpen("item", attr)
			if(item.icon) {
				elementVoid("icon", { class: `fa ${item.icon}` })
			}
			text(item.name)
		elementClose("item")
	},

	renderCategory(item) {
		elementOpen("category")
			elementOpen("header")
				text(item.name)
			elementClose("header")
			componentVoid(ContextMenuInner, { $value: item.children })
		elementClose("category")
	},

	renderMenu(item) {
		const attr = item.func ? { onclick: item.func } : null
		elementOpen("item", attr)
			if(item.icon) {
				elementVoid("icon", { class: `fa ${item.icon}` })
			}		
			text(item.name)
			elementVoid("caret", { class: "fa fa-caret-right"})
			elementOpen("contextmenu")
				if(typeof item.children === "string") {
					componentVoid(ContextMenuInner, { $value: Menu.get(item.children) })
				}
				else {
					componentVoid(ContextMenuInner, { $value: item.children })
				}
			elementClose("contextmenu")
		elementClose("item")
	}
})

const ContextMenu = component({
	mount() {
		this.bind = "state/contextmenu"
	},

	render() {
		const data = this.$value
		if(!data.visible) {
			return
		}

		const element = elementOpen("contextmenu", { 
			style: {
				left: `${data.x}px`,
				top: `${data.y}px`
			}
		}).element
			componentVoid(ContextMenuInner, { $value: data.props })
		elementClose("contextmenu")

		const rect = element.getBoundingClientRect()
		const bodyRect = document.body.getBoundingClientRect()

		const rightSpaceLeft = bodyRect.right - rect.right
		if(rightSpaceLeft < 0) {
			const newX = data.x + rightSpaceLeft - 10
			element.style.left = `${newX}px`
		}

		const bottomSpaceLeft = bodyRect.bottom - rect.bottom
		if(bottomSpaceLeft < 0) {
			const newY = data.y + bottomSpaceLeft
			element.style.top = `${newY}px`
		}
	}
})

export default ContextMenu