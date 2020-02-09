"use strict";

(() => {
	window.__modules = {}

	window.__inherits = (a, b) => {
		const protoA = a.prototype
		const proto = Object.create(b.prototype)

		for(let key in protoA) {
			const param = Object.getOwnPropertyDescriptor(protoA, key)
			if(param.get || param.set) {
				Object.defineProperty(proto, key, param)
			}
			else {
				proto[key] = protoA[key]
			}
		}

		a.prototype = proto
		a.prototype.constructor = a
		a.__parent = b

		if(b.__inherit === undefined) {
			b.__inherit = {}
		}

		b.__inherit[a.name] = a

		const parent = b.__parent
		while(parent) {
			parent.__inherit[a.name] = a
			parent = parent.__parent
		}
	}

	window.__exportAll = (obj, exports) => {
		Object.keys(obj).forEach((key) => {
			if(key === "default" || key === "__esModule") {
				return
			}
			Object.defineProperty(exports, key, {
				enumerable: true,
				get() {
					return obj[key]
				}
			})
		})
	}
})();


(() => {
	const connection = new WebSocket("ws://127.0.0.1:" + REPLICA_SERVER_PORT, [ "soap", "xmpp" ])
	connection.onopen = () => {
		console.log("(replica) Connected to development server")
	}
	connection.onerror = (error) => {
		console.log("(replica) Error:", error)
	}
	connection.onmessage = (event) => {
		document.location.reload()
	}
})();

"use strict";

((exports) => {

function VNode(id, type, props, element) {
	this.id = id
	this.type = type
	this.props = props
	this.element = element
	this.children = []
	this.index = 0
	this.component = null
}
exports.VNode = VNode

})(__modules[0] = {})

//# sourceURL=node_modules\wabi\src\vnode.js

"use strict";

((exports) => {

const __module0 = __modules[0]
const VNode = __module0.VNode
const namespaceSVG = "http://www.w3.org/2000/svg"
const stack = new Array(64)
const components = {}
let stackIndex = 0
let bodyNode = null
const elementOpen = (type, props, srcElement) => {
	const parent = stack[stackIndex]
	let prevNode = parent.children[parent.index]
	let vnode = prevNode
	if(!prevNode) {
		let element
		if(srcElement) {
			element = srcElement
		}
		else {
			const namespace = (type === "svg") ? namespaceSVG : parent.element.namespaceURI
			element = document.createElementNS(namespace, type)
		}
		vnode = new VNode(parent.index, type, null, element)
		element.__vnode = vnode
		if(props) {
			for(let key in props) {
				setProp(element, key, props[key])
			}
		}
		vnode.props = props
		if(parent.component) {
			if((parent.index > 0)) {
				const parentParent = stack[(stackIndex - 1)]
				const parentNext = parentParent.children[(parent.id + 1)]
				if(parentNext && parentNext.component) {
					parent.element.insertBefore(element, parentNext.component.base)
				}
				else {
					parent.element.insertBefore(element, parent.children[(parent.index - 1)].element.nextSibling)
				}
			}
			else {
				parent.element.insertBefore(element, parent.component.base.nextSibling)
			}
		}
		else {
			parent.element.appendChild(element)
		}
		parent.children.push(vnode)
	}
	else {
		if((vnode.type !== type)) {
			let element
			if(srcElement) {
				element = srcElement
			}
			else {
				const namespace = (type === "svg") ? namespaceSVG : parent.element.namespaceURI
				element = document.createElementNS(namespace, type)
			}
			element.__vnode = vnode
			if(vnode.component) {
				vnode.element.replaceChild(element, vnode.component.base)
				removeComponent(vnode)
				vnode.component = null
				appendChildren(element, vnode.children)
			}
			else {
				const prevElement = prevNode.element
				appendChildren(element, vnode.children)
				prevElement.parentElement.replaceChild(element, prevElement)
			}
			vnode.element = element
			vnode.type = type
			if(props) {
				for(let key in props) {
					setProp(element, key, props[key])
				}
			}
			vnode.props = props
		}
		else {
			const element = prevNode.element
			const prevProps = prevNode.props
			if((props !== prevProps)) {
				if(props) {
					if(prevProps) {
						for(let key in prevProps) {
							if((props[key] === undefined)) {
								unsetProp(element, key)
							}
						}
						for(let key in props) {
							const value = props[key]
							if((value !== prevProps[key])) {
								setProp(element, key, value)
							}
						}
					}
					else {
						for(let key in props) {
							setProp(element, key, props[key])
						}
					}
					prevNode.props = props
				}
				else {
					if(prevProps) {
						for(let key in prevProps) {
							unsetProp(element, key)
						}
						prevNode.props = null
					}
				}
			}
		}
	}
	parent.index++
	stackIndex++
	stack[stackIndex] = vnode
	return vnode
}
const appendChildren = (element, children) => {
	for(let n = 0; (n < children.length); n++) {
		const child = children[n]
		if(child.component) {
			element.appendChild(child.component.base)
			child.element = element
			appendChildren(element, child.children)
		}
		else {
			element.appendChild(child.element)
		}
	}
}
const elementClose = (type) => {
	const node = stack[stackIndex]
	if((node.type !== type)) {
		console.error("(Element.close) Unexpected element closed: " + type + " but was expecting: " + node.type)
	}
	if((node.index !== node.children.length)) {
		removeUnusedNodes(node)
	}
	node.index = 0
	stackIndex--
}
const elementVoid = (type, props) => {
	const node = elementOpen(type, props)
	elementClose(type)
	return node
}
const element = (element, props) => {
	const node = elementOpen(element.localName, props, element)
	elementClose(element.localName)
	return node
}
const componentVoid = (ctor, props) => {
	const parent = stack[stackIndex]
	let vnode = parent.children[parent.index]
	let mounted = true
	let component
	if(vnode) {
		component = vnode.component
		if(component) {
			if((component.constructor === ctor)) {
				diffComponentProps(component, vnode, props)
				mounted = false
			}
			else {
				const newComponent = createComponent(ctor)
				newComponent.vnode = vnode
				vnode.element.replaceChild(newComponent.base, component.base)
				removeComponent(vnode)
				component = newComponent
				vnode.component = newComponent
				vnode.props = props
				for(let key in props) {
					newComponent[key] = props[key]
				}
			}
		}
		else {
			const vnodeNew = new VNode(vnode.id, null, null, parent.element)
			component = createComponent(ctor)
			component.vnode = vnodeNew
			vnodeNew.component = component
			vnodeNew.children.push(vnode)
			parent.element.insertBefore(component.base, vnode.element)
			parent.children[vnode.id] = vnodeNew
			vnode.id = 0
			vnode.parent = vnodeNew
			vnode = vnodeNew
			diffComponentProps(component, vnode, props)
		}
	}
	else {
		vnode = new VNode(parent.children.length, null, null, parent.element)
		component = createComponent(ctor)
		component.vnode = vnode
		vnode.component = component
		parent.children.push(vnode)
		parent.element.appendChild(component.base)
		diffComponentProps(component, vnode, props)
	}
	if(mounted && component.mounted) {
		component.mounted()
	}
	parent.index++
	stackIndex++
	stack[stackIndex] = vnode
	component.depth = stackIndex
	component.render()
	component.dirty = false
	if((vnode.index !== vnode.children.length)) {
		removeUnusedNodes(vnode)
	}
	vnode.index = 0
	stackIndex--
	return component
}
const diffComponentProps = (component, node, props) => {
	const prevProps = node.props
	if((props !== prevProps)) {
		if(props) {
			if(prevProps) {
				for(let key in prevProps) {
					if((props[key] === undefined)) {
						if((key[0] === "$")) {
							component[key] = component.state[key.slice(1)]
						}
						else {
							component[key] = null
						}
					}
				}
				for(let key in props) {
					const value = props[key]
					if((component[key] !== value)) {
						component[key] = value
					}
				}
			}
			else {
				for(let key in props) {
					component[key] = props[key]
				}
			}
			node.props = props
		}
		else if(prevProps) {
			for(let key in prevProps) {
				if((key[0] === "$")) {
					component[key] = component.state[key.slice(1)]
				}
				else {
					component[key] = null
				}
			}
			node.props = null
		}
	}
}
const createComponent = (ctor) => {
	const buffer = components[ctor.prototype.__componentIndex]
	let component = buffer ? buffer.pop() : null
	if(!component) {
		component = new ctor()
	}
	if(component.mount) {
		component.mount()
	}
	component.dirty = true
	return component
}
const removeComponent = (vnode) => {
	const props = vnode.props
	const component = vnode.component
	const buffer = components[component.__componentIndex]
	if(buffer) {
		buffer.push(component)
	}
	else {
		components[component.__componentIndex] = [ component ]
	}
	for(let key in props) {
		component[key] = null
	}
	vnode.props = null
	component.remove()
	component.base.remove()
}
const text = (text) => {
	const parent = stack[stackIndex]
	let vnode = parent.children[parent.index]
	if(vnode) {
		if((vnode.type === "#text")) {
			if((vnode.element.nodeValue !== text)) {
				vnode.element.nodeValue = text
			}
		}
		else {
			const element = document.createTextNode(text)
			if(vnode.component) {
				vnode.element.replaceChild(element, vnode.component.base)
				removeComponent(vnode)
				vnode.component = null
			}
			else {
				vnode.element.parentElement.replaceChild(element, vnode.element)
			}
			removeUnusedNodes(vnode)
			vnode.type = "#text"
			vnode.element = element
		}
	}
	else {
		const element = document.createTextNode(text)
		vnode = new VNode(parent.children.length, "#text", null, element)
		parent.children.push(vnode)
		parent.element.appendChild(element)
	}
	parent.index++
	return vnode
}
const setProp = (element, name, value) => {
	if((name === "class")) {
		element.className = value
	}
	else if((name === "style")) {
		if((typeof value === "object")) {
			const elementStyle = element.style
			for(let key in value) {
				elementStyle[key] = value[key]
			}
		}
		else {
			element.style.cssText = value
		}
	}
	else if((name[0] === "o") && (name[1] === "n")) {
		element[name] = value
	}
	else if((typeof element[name] === "boolean")) {
		element[name] = value
	}
	else {
		element.setAttribute(name, value)
	}
}
const unsetProp = (element, name) => {
	if((name === "class")) {
		element.className = ""
	}
	else if((name === "style")) {
		element.style.cssText = ""
	}
	else if((name[0] === "o") && (name[1] === "n")) {
		element[name] = null
	}
	else if((typeof element[name] === "boolean")) {
		element[name] = false
	}
	else {
		element.removeAttribute(name)
	}
}
const render = (component, parentElement, props) => {
	if(!bodyNode) {
		bodyNode = new VNode(0, "body", null, parentElement)
		parentElement.__vnode = bodyNode
	}
	stackIndex = 0
	stack[0] = bodyNode
	componentVoid(component, props)
	if((bodyNode.index !== bodyNode.children.length)) {
		removeUnusedNodes(bodyNode)
	}
	bodyNode.index = 0
}
const renderInstance = (instance) => {
	const vnode = instance.vnode
	stackIndex = instance.depth
	stack[(instance.depth - 1)] = vnode.element.__vnode
	stack[instance.depth] = vnode
	instance.render()
	instance.dirty = false
	if((vnode.index !== vnode.children.length)) {
		removeUnusedNodes(vnode)
	}
	vnode.index = 0
}
const removeUnusedNodes = (node) => {
	const children = node.children
	for(let n = node.index; (n < children.length); n++) {
		const child = children[n]
		removeNode(child)
	}
	children.length = node.index
}
const removeNode = (node) => {
	if(node.component) {
		removeComponent(node)
	}
	else {
		if(node.element.parentElement) {
			node.element.parentElement.removeChild(node.element)
		}
	}
	const children = node.children
	for(let n = 0; (n < children.length); n++) {
		const child = children[n]
		removeNode(child)
	}
	node.children.length = 0
}
const removeAll = () => {
	removeUnusedNodes(bodyNode)
}
const getBodyNode = () => {
	return bodyNode
}
exports.elementOpen = elementOpen
exports.elementClose = elementClose
exports.elementVoid = elementVoid
exports.element = element
exports.componentVoid = componentVoid
exports.text = text
exports.render = render
exports.renderInstance = renderInstance
exports.removeAll = removeAll
exports.getBodyNode = getBodyNode

})(__modules[1] = {})

//# sourceURL=node_modules\wabi\src\dom.js

"use strict";

((exports) => {

const __module1 = __modules[1]
const render = __module1.render
const renderInstance = __module1.renderInstance
const removeAll = __module1.removeAll
const updateBuffer = []
const routes = []
let needUpdate = false
let needUpdateRoute = false
let currRouteResult = []
let currRoute = null
let url = null
function Route(regexp, component, enterFunc, exitFunc, readyFunc) {
	this.regexp = regexp
	this.component = component
	this.enterFunc = enterFunc || null
	this.exitFunc = exitFunc || null
	this.readyFunc = readyFunc || null
}
const update = function(instance) {
	if(instance.dirty) {
		return
	}
	instance.dirty = true
	updateBuffer.push(instance)
	needUpdate = true
}
const renderLoop = function() {
	if(needUpdate) {
		updateRender()
	}
	if(needUpdateRoute) {
		updateRoute()
	}
	window.requestAnimationFrame(renderLoop)
}
const updateRender = function() {
	updateBuffer.sort(sortByDepth)
	for(let n = 0; (n < updateBuffer.length); n++) {
		const node = updateBuffer[n]
		if(!node.dirty) {
			continue
		}
		renderInstance(node)
	}
	updateBuffer.length = 0
	needUpdate = false
}
const sortByDepth = function(a, b) {
	return (a.depth - b.depth)
}
const route = function(regexp, component, enterFunc, exitFunc, readyFunc) {
	routes.push(new Route(regexp, component, enterFunc, exitFunc, readyFunc))
	needUpdateRoute = true
}
const updateRoute = function() {
	url = (document.location.pathname + document.location.hash)
	currRouteResult.length = 0
	let result
	for(let n = 0; (n < routes.length); n++) {
		const routeItem = routes[n]
		if(routeItem.regexp) {
			const regex = new RegExp(routeItem.regexp, "g")
			while(result = regex.exec(url)) {
				currRouteResult.push(result)
			}
			if((currRouteResult.length === 0)) {
				continue
			}
		}
		if(currRoute && currRoute.exitFunc) {
			currRoute.exitFunc()
		}
		currRoute = routeItem
		let props = null
		if(currRoute.enterFunc) {
			props = currRoute.enterFunc(currRouteResult)
		}
		render(currRoute.component, document.body, props)
		if(currRoute.readyFunc) {
			currRoute.readyFunc()
		}
		break
	}
	if(!currRoute) {
		console.warn(("Could not found route for: " + url))
	}
	needUpdateRoute = false
}
const clearRoutes = function(remove) {
	routes.length = 0
	currRoute = null
	if(remove) {
		removeAll()
	}
}
const onDomLoad = () => {
	if((document.readyState === "interactive") || (document.readyState === "complete")) {
		renderLoop()
		return
	}
	const callbackFunc = (event) => {
		renderLoop()
		window.removeEventListener("DOMContentLoaded", callbackFunc)
	}
	window.addEventListener("DOMContentLoaded", callbackFunc)
}
window.addEventListener("hashchange", () => {
	updateRoute()
})
onDomLoad(renderLoop)
exports.update = update
exports.route = route
exports.clearRoutes = clearRoutes

})(__modules[2] = {})

//# sourceURL=node_modules\wabi\src\renderer.js

"use strict";

((exports) => {

const __module2 = __modules[2]
const update = __module2.update
class Proxy {
	constructor(key, func) {
		this.key = key
		this.func = func
	}
}

class WatcherBuffer {
	constructor() {
		this.funcs = []
		this.buffer = null
	}
}

class RemoveInfo {
	constructor(path, func) {
		this.path = path
		this.func = func
	}
}

class Store {
	constructor() {
		this.data = {}
		this.proxies = []
		this.emitting = 0
		this.removeWatchers = []
		this.watchers = new WatcherBuffer()
		this.watchers.buffer = {}
	}
	set(key, value) {
		this.dispatch({
			action: "SET",
			key: key,
			value: value
		})
	}
	add(key, value) {
		this.dispatch({
			action: "ADD",
			key: key,
			value: value
		})
	}
	remove(key, value) {
		this.dispatch({
			action: "REMOVE",
			key: key,
			value: value
		})
	}
	update(key, value) {
		this.dispatch({
			action: "UPDATE",
			key: key
		})
	}
	dispatch(data) {
		if(this.globalProxy) {
			this.globalProxy(data)
		}
		else {
			this.handle(data, null)
		}
	}
	performSet(payload, promise) {
		const tuple = this.getData(payload.key)
		if(!tuple) {
			return
		}
		if(payload.key) {
			tuple.data[tuple.key] = payload.value
			if(promise) {
				promise.then((resolve, reject) => {
					this.emit({
						action: "SET",
						key: tuple.parentKey,
						value: tuple.data
					}, tuple.watchers, "SET", tuple.key, payload.value)
				})
			}
			else {
				this.emit({
					action: "SET",
					key: tuple.parentKey,
					value: tuple.data
				}, tuple.watchers, "SET", tuple.key, payload.value)
			}
		}
		else {
			this.data = payload.value
			if(promise) {
				promise.then((resolve, reject) => {
					this.emitWatchers({
						action: "SET",
						key: "",
						value: payload.value
					}, this.watchers)
				})
			}
			else {
				this.emitWatchers({
					action: "SET",
					key: "",
					value: payload.value
				}, this.watchers)
			}
		}
	}
	performAdd(payload, promise) {
		const tuple = this.getData(payload.key)
		if(!tuple) {
			return
		}
		let array = tuple.data[tuple.key]
		if(!array) {
			array = [ payload.value ]
			tuple.data[tuple.key] = array
		}
		else if(!Array.isArray(array)) {
			console.warn("(store) Data at key '" + payload.key + "' is not an Array")
			return
		}
		else {
			array.push(payload.value)
		}
		if(tuple.watchers) {
			const funcs = tuple.watchers.funcs
			if(funcs) {
				const payloadSet = {
					action: "SET",
					key: tuple.key,
					value: tuple.data
				}
				for(let n = 0; (n < funcs.length); n++) {
					funcs[n](payloadSet)
				}
				const buffer = tuple.watchers.buffer
				if(buffer) {
					const watchers = buffer[tuple.key]
					if(watchers) {
						const funcs = watchers.funcs
						if(funcs) {
							payloadSet.value = array
							for(let n = 0; (n < funcs.length); n++) {
								funcs[n](payloadSet)
							}
						}
					}
				}
			}
		}
	}
	performRemove(payload, promise) {
		const tuple = this.getData(payload.key)
		if(!tuple) {
			return
		}
		const data = payload.value ? tuple.data[tuple.key] : tuple.data
		if(Array.isArray(data)) {
			let index
			if((payload.value !== undefined)) {
				index = data.indexOf(payload.value)
				if((index === -1)) {
					return
				}
				data.splice(index, 1)
			}
			else {
				index = parseInt(tuple.key)
				data.splice(index, 1)
			}
			const payloadOut = {
				action: "SET",
				key: null,
				value: null
			}
			if(payload.value) {
				payloadOut.key = tuple.key
				payloadOut.value = data
				const buffer = tuple.watchers.buffer[tuple.key]
				const funcs = buffer.funcs
				for(let n = 0; (n < funcs.length); n++) {
					funcs[n](payloadOut)
				}
			}
			else {
				if(tuple.parentKey) {
					payloadOut.key = tuple.parentKey
					payloadOut.value = data
					if(tuple.watchers) {
						const watchers = tuple.watchers.funcs
						for(let n = 0; (n < watchers.length); n++) {
							watchers[n](payloadOut)
						}
					}
				}
				if(tuple.watchers) {
					const buffer = tuple.watchers.buffer
					for(let key in buffer) {
						const keyIndex = (key | 0)
						if((keyIndex >= index) && (data.length >= keyIndex)) {
							payloadOut.key = key
							payloadOut.value = data[keyIndex]
							this.emitWatchers(payloadOut, buffer[key])
						}
					}
				}
			}
		}
		else {
			if((payload.value !== undefined)) {
				delete data[payload.value]
				this.emitWatchers({
					action: "REMOVE",
					key: payload.value
				}, tuple.watchers.buffer[tuple.key])
				return
			}
			else {
				delete data[tuple.key]
			}
			this.emit({
				action: "SET",
				key: tuple.parentKey,
				value: tuple.data
			}, tuple.watchers, "REMOVE", tuple.key, null)
		}
	}
	performUpdate(payload) {
		const tuple = this.getData(payload.key)
		if(!tuple || !tuple.watchers || !tuple.watchers.buffer) {
			return
		}
		const watchers = tuple.watchers.buffer[tuple.key]
		if(!watchers) {
			return
		}
		this.emitWatchers({
			action: "SET",
			key: payload.key,
			value: tuple.data[tuple.key]
		}, watchers)
	}
	handle(data, promise) {
		switch(data.action) {
			case "SET":
			this.performSet(data, promise)
			break

			case "ADD":
			this.performAdd(data, promise)
			break

			case "REMOVE":
			this.performRemove(data, promise)
			break

			case "UPDATE":
			this.performUpdate(data, promise)
			break

		}
		for(let n = 0; (n < this.proxies.length); n++) {
			const proxy = this.proxies[n]
			if((data.key.indexOf(proxy.key) === 0)) {
				if(proxy.func(data)) {
					return
				}
			}
		}
	}
	watch(path, func) {
		if(!path) {
			return
		}
		let watchers = this.watchers
		const keys = path.split("/")
		for(let n = 0; (n < keys.length); n++) {
			const key = keys[n]
			const buffer = watchers.buffer
			if(buffer) {
				const nextWatchers = buffer[key]
				if(!nextWatchers) {
					const newWatchers = new WatcherBuffer()
					watchers.buffer[key] = newWatchers
					watchers = this.fillWatchers(newWatchers, keys, (n + 1))
					break
				}
				else {
					watchers = nextWatchers
				}
			}
			else {
				watchers = this.fillWatchers(watchers, keys, n)
				break
			}
		}
		watchers.funcs.push(func)
	}
	fillWatchers(watchers, keys, index) {
		for(let n = index; (n < keys.length); n++) {
			const newWatcher = new WatcherBuffer()
			watchers.buffer = {}
			watchers.buffer[keys[n]] = newWatcher
			watchers = newWatcher
		}
		return watchers
	}
	unwatch(path, func) {
		if(!path) {
			return
		}
		if(this.emitting) {
			const removeInfo = new RemoveInfo(path, func)
			this.removeWatchers.push(removeInfo)
			return
		}
		let watchers = this.watchers
		let prevWatchers = null
		const keys = path.split("/")
		for(let n = 0; (n < keys.length); n++) {
			if(!watchers.buffer) {
				console.warn("(store.unwatch) Watcher can not be found for:", path)
				return
			}
			prevWatchers = watchers
			watchers = watchers.buffer[keys[n]]
			if(!watchers) {
				return
			}
		}
		const funcs = watchers.funcs
		const index = funcs.indexOf(func)
		if((index === -1)) {
			console.warn("(store.unwatch) Watcher can not be found for:", path)
			return
		}
		funcs[index] = funcs[(funcs.length - 1)]
		funcs.pop()
	}
	emit(payload, watchers, action, key, value) {
		if(!watchers) {
			return
		}
		this.emitting++
		const funcs = watchers.funcs
		if(funcs) {
			for(let n = 0; (n < funcs.length); n++) {
				funcs[n](payload)
			}
		}
		watchers = watchers.buffer ? watchers.buffer[key] : null
		if(watchers) {
			payload.action = action
			payload.key = key
			payload.value = value
			this.emitWatchers(payload, watchers)
		}
		this.emitting--
		if((this.emitting === 0)) {
			if((this.removeWatchers.length > 0)) {
				for(let n = 0; (n < this.removeWatchers.length); n++) {
					const info = this.removeWatchers[n]
					this.unwatch(info.path, info.func)
				}
				this.removeWatchers.length = 0
			}
		}
	}
	emitWatchers(payload, watchers) {
		this.emitting++
		const funcs = watchers.funcs
		if(funcs) {
			for(let n = 0; (n < funcs.length); n++) {
				funcs[n](payload)
			}
		}
		const buffer = watchers.buffer
		if(buffer) {
			const value = payload.value
			if(value && (typeof value === "object")) {
				for(let key in buffer) {
					payload.key = key
					payload.value = (value[key] === undefined) ? null : value[key]
					this.emitWatchers(payload, buffer[key])
				}
			}
			else {
				payload.value = null
				for(let key in buffer) {
					payload.key = key
					this.emitWatchers(payload, buffer[key])
				}
			}
		}
		this.emitting--
	}
	get(key) {
		if(!key) {
			if((key === undefined)) {
				return ""
			}
			return this.data
		}
		const buffer = key.split("/")
		let data = this.data
		for(let n = 0; (n < buffer.length); n++) {
			const id = buffer[n]
			if((id === "@")) {
				return buffer[(n - 1)]
			}
			else {
				data = data[id]
			}
			if((data === undefined)) {
				return null
			}
		}
		return data
	}
	getData(path) {
		if(!path) {
			const tuple = {
				data: this.data,
				key: null,
				parentKey: null,
				watchers: null
			}
			return tuple
		}
		const keys = path.split("/")
		const num = (keys.length - 1)
		if((num === 0)) {
			const tuple = {
				data: this.data,
				key: keys[0],
				parentKey: null,
				watchers: this.watchers
			}
			return tuple
		}
		let data = this.data
		let watchers = this.watchers
		for(let n = 0; (n < num); n++) {
			const key = keys[n]
			const newData = data[key]
			if(!newData) {
				console.warn("(store.getData) No data available with key: [" + keys[n] + "] with path: [" + path + "]")
				return null
			}
			data = newData
			if(watchers) {
				watchers = watchers.buffer ? watchers.buffer[key] : null
			}
		}
		const tuple = {
			data: data,
			key: keys[num],
			parentKey: keys[(num - 1)],
			watchers: watchers
		}
		return tuple
	}
	addProxy(key, func) {
		if((key === "")) {
			if(this.globalProxy) {
				console.warn("(wabi.proxy) There is already global proxy declared")
				return
			}
			this.globalProxy = func
		}
		else {
			for(let n = 0; (n < this.proxies.length); n++) {
				const proxy = this.proxies[n]
				if((proxy.key === key) && (proxy.func === func)) {
					console.warn("(wabi.proxy) There is already a proxy declared with key:", key)
					return
				}
			}
			const proxy = new Proxy(key, func)
			this.proxies.push(proxy)
		}
	}
	removeProxy(key, func) {
		if((key === "")) {
			if((this.globalProxy !== func)) {
				console.warn("(wabi.proxy) Global proxy functions don`t match")
				return
			}
			this.globalProxy = null
		}
		else {
			for(let n = 0; (n < this.proxies.length); n++) {
				const proxy = this.proxies[n]
				if((proxy.key === key) && (proxy.func === func)) {
					this.proxies[n] = this.proxies[(this.proxies.length - 1)]
					this.proxies.pop()
					return
				}
			}
		}
	}
	toJSON() {
		return this.data
	}
}

const store = new Store()
const lastSegment = function(str) {
	const index = str.lastIndexOf("/")
	if((index === -1)) {
		return null
	}
	return str.slice((index + 1))
}
exports.store = store
exports.lastSegment = lastSegment

})(__modules[3] = {})

//# sourceURL=node_modules\wabi\src\store.js

"use strict";

((exports) => {

const __module2 = __modules[2]
const update = __module2.update
const __module3 = __modules[3]
const store = __module3.store
let componentIndex = 0
function WabiComponentInternal() {
	this.bindFuncs = {}
	this.vnode = null
	this.dirty = false
	this.base = document.createTextNode("")
	const currState = {}
	for(let key in this.state) {
		currState[key] = this.state[key]
	}
	this.$ = currState
}
WabiComponentInternal.prototype = {
	_bind: null,
	mount: null,
	mounted: null,
	unmount: null,
	render: null,
	state: {
		value: null
	},
	remove() {
		if(this.unmount) {
			this.unmount()
		}
		this.reset()
	},
	reset() {
		if((typeof this._bind === "string")) {
			store.unwatch(this._bind, this.bindFuncs.value)
		}
		else {
			for(let key in this._bind) {
				store.unwatch(this._bind[key], this.bindFuncs[key])
			}
		}
		this._bind = null
		this.dirty = false
		const currState = this.$
		const initState = this.state
		for(let key in currState) {
			currState[key] = initState[key]
		}
	},
	handleAction(state, value) {
		this.$[state] = value
		update(this)
	},
	setState(key, value) {
		if((this.$[key] === value)) {
			return
		}
		if(this._bind) {
			if((typeof this._bind === "string")) {
				if((key === "value")) {
					store.set(this._bind, value, true)
				}
				else {
					this.$[key] = value
					update(this)
				}
			}
			else {
				const binding = this._bind[key]
				if(binding) {
					store.set(binding, value, true)
				}
				else {
					this.$[key] = value
					update(this)
				}
			}
		}
		else {
			this.$[key] = value
			update(this)
		}
	},
	set bind(value) {
		const prevBind = this._bind
		if(prevBind) {
			if(value) {
				if((typeof prevBind === "string")) {
					if((prevBind !== value)) {
						const func = this.bindFuncs.value
						store.unwatch(prevBind, func)
						store.watch(value, func)
					}
					this.$.value = store.get(value)
				}
				else {
					for(let key in prevBind) {
						if((value[key] === undefined)) {
							const func = this.bindFuncs[key]
							store.unwatch(prevBind[key], func)
							this.bindFuncs[key] = undefined
						}
					}
					for(let key in value) {
						const bindPath = value[key]
						if((prevBind[key] !== bindPath)) {
							let func = this.bindFuncs[key]
							if(!func) {
								func = (payload) => {
									this.handleAction(key, payload.value)
								}
								this.bindFuncs[key] = func
							}
							store.unwatch(prevBind[key], func)
							store.watch(bindPath, func)
							this.$[key] = store.get(bindPath)
						}
					}
				}
			}
			else {
				if((typeof prevBind === "string")) {
					store.unwatch(prevBind, this.bindFuncs.value)
					this.$.value = this.state.value
				}
				else {
					for(let key in prevBind) {
						store.unwatch(prevBind[key], this.bindFuncs[key])
						this.bindFuncs[key] = undefined
						this.$[key] = this.state[key]
					}
				}
			}
		}
		else {
			if((typeof value === "string")) {
				const func = (payload) => {
					this.handleAction("value", payload.value)
				}
				this.bindFuncs.value = func
				store.watch(value, func)
				this.$.value = store.get(value)
			}
			else {
				for(let key in value) {
					const bindValue = value[key]
					if(!bindValue) {
						continue
					}
					const func = (payload) => {
						this.handleAction(key, payload.value)
					}
					this.bindFuncs[key] = func
					store.watch(bindValue, func)
					this.$[key] = store.get(bindValue)
				}
			}
		}
		this._bind = value
		this.dirty = true
	},
	get bind() {
		return this._bind
	},
	updateAll() {
		update(this)
		const children = this.vnode.children
		for(let n = 0; (n < children.length); n++) {
			const child = children[n]
			if(child.component) {
				update(child.component)
			}
		}
	}
}
const component = (componentProto) => {
	function WabiComponent() {
		WabiComponentInternal.call(this)
	}
	const proto = Object.create(WabiComponentInternal.prototype)
	for(let key in componentProto) {
		const param = Object.getOwnPropertyDescriptor(componentProto, key)
		if(param.get || param.set) {
			Object.defineProperty(proto, key, param)
		}
		else {
			proto[key] = componentProto[key]
		}
	}
	proto.__componentIndex = componentIndex++
	const states = proto.state
	for(let key in states) {
		Object.defineProperty(proto, ("$" + key), {
			set(value) {
				this.setState(key, value)
			},
			get() {
				return this.$[key]
			}
		})
	}
	WabiComponent.prototype = proto
	WabiComponent.prototype.constructor = WabiComponent
	return WabiComponent
}
exports.component = component

})(__modules[4] = {})

//# sourceURL=node_modules\wabi\src\component.js

"use strict";

((exports) => {

const lastSegment = (str) => {
	const index = str.lastIndexOf(".")
	if((index === -1)) {
		return null
	}
	return str.slice((index + 1))
}
const selectElementContents = (node) => {
	const range = document.createRange()
	range.selectNodeContents(node)
	const selection = window.getSelection()
	selection.removeAllRanges()
	selection.addRange(range)
}
exports.lastSegment = lastSegment
exports.selectElementContents = selectElementContents

})(__modules[5] = {})

//# sourceURL=node_modules\wabi\src\utils.js

"use strict";

((exports) => {

const __module0 = __modules[0]
const VNode = __module0.VNode
exports.VNode = VNode
const __module4 = __modules[4]
const component = __module4.component
exports.component = component
const __module1 = __modules[1]
const elementOpen = __module1.elementOpen
exports.elementOpen = elementOpen
const elementClose = __module1.elementClose
exports.elementClose = elementClose
const elementVoid = __module1.elementVoid
exports.elementVoid = elementVoid
const element = __module1.element
exports.element = element
const componentVoid = __module1.componentVoid
exports.componentVoid = componentVoid
const text = __module1.text
exports.text = text
const render = __module1.render
exports.render = render
const __module2 = __modules[2]
const update = __module2.update
exports.update = update
const route = __module2.route
exports.route = route
const clearRoutes = __module2.clearRoutes
exports.clearRoutes = clearRoutes
const __module3 = __modules[3]
const store = __module3.store
exports.store = store
const __module5 = __modules[5]
const lastSegment = __module5.lastSegment
exports.lastSegment = lastSegment
const selectElementContents = __module5.selectElementContents
exports.selectElementContents = selectElementContents

})(__modules[6] = {})

//# sourceURL=node_modules\wabi\index.js

"use strict";

((exports) => {

const rngBuffer = new Uint8Array(16)
const tempResult = new Array(16)
const byteToHex = new Array(256)
for(let n = 0; (n < 256); n++) {
	byteToHex[n] = (n + 0x100).toString(16).substr(1)
}
const uuid4 = () => {
	crypto.getRandomValues(rngBuffer)
	rngBuffer[6] = ((rngBuffer[6] & 0x0f) | 0x40)
	rngBuffer[8] = ((rngBuffer[8] & 0x3f) | 0x80)
	for(let n = 0; (n < 16); n++) {
		tempResult[n] = byteToHex[rngBuffer[n]]
	}
	return tempResult.join("")
}
const cloneObj = (obj) => {
	if(!obj) {
		return null
	}
	if(Array.isArray(obj)) {
		const result = []
		for(let n = 0; (n < obj.length); n++) {
			const value = obj[n]
			if((typeof value === "object") && (value !== undefined)) {
				if((value instanceof Array)) {
					result[n] = value.slice(0)
				}
				else {
					result[n] = cloneObj(value)
				}
			}
			else {
				result[n] = value
			}
		}
		return result
	}
	const result = {}
	for(let key in obj) {
		const value = obj[key]
		if((typeof value === "object") && (value !== undefined)) {
			if(Array.isArray(value)) {
				const array = new Array(value.length)
				for(let n = 0; (n < value.length); n++) {
					array[n] = cloneObj(value[n])
				}
				result[key] = array
			}
			else {
				if(value) {
					result[key] = cloneObj(value)
				}
				else {
					result[key] = null
				}
			}
		}
		else {
			result[key] = value
		}
	}
	return result
}
const readFile = (file, callback) => {
	const reader = new FileReader()
	reader.onload = (fileResult) => {
		callback(fileResult.target.result)
	}
	reader.readAsText(file)
}
const dataURItoBlob = (dataURI, type) => {
	const binary = atob(dataURI.split(",")[1])
	const length = binary.length
	const array = new Uint8Array(length)
	for(let n = 0; (n < length); n++) {
		array[n] = binary.charCodeAt(n)
	}
	return new Blob([ array ], {
		type: type
	})
}
const hasItems = (obj) => {
	for(let key in obj) {
		return true
	}
	return false
}
exports.default = {
	uuid4: uuid4,
	cloneObj: cloneObj,
	readFile: readFile,
	hasItems: hasItems
}

})(__modules[7] = {})

//# sourceURL=src\Utils.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const Utils = __modules[7].default
function SchemaData(id, item) {
	this.id = id
	this.index = id
	this.item = item
	this.schema = null
	this.cache = createCache()
}
const sortKey = (a, b) => {
	return a.localeCompare(b)
}
const apply = (id, schema) => {
	const asset = store.get("assets/" + id)
	const cache = asset.cache
	const schemaPrev = createSchemaCache(cache.schema)
	diff(asset.data, schema, schemaPrev)
	cache.schema = populateSchema(schema)
	cache.schemaCache = schema
	updateBuffer(asset)
	store.update("assets/" + id + "/data")
	store.update("assets/" + id + "/cache")
}
const diff = (asset, schema, schemaPrev) => {
	const buffer = schema.buffer
	const bufferPrev = schemaPrev.buffer
	const props = []
	let types = null
	let typeIndex = -1
	let numEntriesPrev = 0
	for(let n = 0; (n < buffer.length); n++) {
		const entry = buffer[n]
		const entryPrev = bufferPrev.find((src) => (src.id === entry.id))
		if((entryPrev !== undefined)) {
			numEntriesPrev++
		}
	}
	if((numEntriesPrev !== bufferPrev.length)) {
		loop:
		for(let n = 0; (n < bufferPrev.length); n++) {
			const entryPrev = bufferPrev[n]
			for(let m = 0; (m < buffer.length); m++) {
				const entry = buffer[m]
				if((entry.id === entryPrev.id)) {
					continue
				}
			}
			modifyAsset_remove(asset, entryPrev)
		}
	}
	for(let n = 0; (n < buffer.length); n++) {
		const entry = buffer[n]
		const entryItem = entry.item
		const entryPrev = bufferPrev.find((src) => (src.id === entry.id))
		if((entryPrev !== undefined)) {
			const entryItemPrev = entryPrev.item
			numEntriesPrev++
			if((entryItem.key !== entryItemPrev.key)) {
				modifyAsset_rename(asset, entryItemPrev.key, entryItem.key)
			}
			if((entryItem.type !== entryItemPrev.type)) {
				modifyAsset_type(asset, entryItem, entryItemPrev.type)
			}
			switch(entryItem.type) {
				case "Type":
				{
					props.push(n)
					types = []
					typeIndex = n
					const schemas = entry.schema
					const schemasPrev = entryPrev.schema
					const typesPrev = {}
					if(schemasPrev) {
						for(let n = 0; (n < schemasPrev.length); n++) {
							const item = schemasPrev[n]
							typesPrev[item.id] = item
						}
					}
					for(let n = 0; (n < schemas.length); n++) {
						const schema = schemas[n]
						const schemaPrev = typesPrev[schema.id]
						types.push(schema.type)
						if(!schemaPrev) {
							continue
						}
						if((schema.type !== schemaPrev.type)) {
							modifyAsset_typeRename(asset, entryItem.key, schema.type, schemaPrev.type)
						}
						let propsHandled = 0
						const properties = schema.schema.buffer
						const propertiesPrev = schemaPrev.schema.buffer
						for(let m = 0; (m < properties.length); m++) {
							const propertyEntry = properties[m]
							const propertyEntryPrev = propertiesPrev.find((src) => (src.id === propertyEntry.id))
							const property = propertyEntry.item
							if((propertyEntryPrev !== undefined)) {
								const propertyPrev = propertyEntryPrev.item
								if((property.key !== propertyPrev.key)) {
									modifyAsset_rename(asset, propertyPrev.key, property.key, entryItem.key, schema.type)
								}
								if((property.type !== propertyPrev.type)) {
									modifyAsset_type(asset, property, entryItemPrev.type, entryItem.key, schema.type)
								}
								propsHandled++
								if((property.type === "List")) {
									diffList(asset, propertyEntry, propertyEntryPrev, schema.type)
								}
							}
							else {
								modifyAsset_type(asset, property, entryItemPrev.type, entryItem.key, schema.type)
								if((property.type === "List")) {
									diffList(asset, propertyEntry, emptySchemaCache, schema.type)
								}
							}
						}
						if((propsHandled !== propertiesPrev.length)) {
							loop:
							for(let n = 0; (n < propertiesPrev.length); n++) {
								const entry = propertiesPrev[n]
								for(let m = 0; (m < properties.length); m++) {
									const item = properties[m]
									if((item.id === entry.id)) {
										continue
									}
								}
								modifyAsset_remove(asset, entry, entryItem.key, schema.type)
							}
						}
					}
				}
				break

				case "List":
				props.push(n)
				diffList(asset, entry, entryPrev)
				break

			}
		}
		else {
			modifyAsset_type(asset, entryItem)
			switch(entryItem.type) {
				case "Type":
				{
					props.push(n)
					typeIndex = n
					const schemas = entry.schema
					if((schemas.length > 0)) {
						types = new Array(schemas.length)
						for(let n = 0; (n < schemas.length); n++) {
							const schema = schemas[n]
							types[n] = schema.type
						}
						const defaultType = schemas[0]
						modifyAsset_rowType(asset, entryItem.key, defaultType)
					}
				}
				break

				case "List":
				props.push(n)
				diffList(asset, entry, emptySchemaCache)
				break

			}
		}
	}
	schema.props = props
	schema.typeIndex = typeIndex
	schema.types = types
}
const diffList = (asset, entry, entryPrev, type = null) => {
	if(type) {
		for(let m = 0; (m < asset.length); m++) {
			const data = asset[m]
			if((data.type === type)) {
				diff(data[entry.item.key], entry.schema, entryPrev.schema)
			}
		}
	}
	else {
		for(let m = 0; (m < asset.length); m++) {
			const data = asset[m]
			diff(data[entry.item.key], entry.schema, entryPrev.schema)
		}
	}
}
const createCache = () => {
	return {
		open: false,
		sortKey: null,
		sortAsc: true
	}
}
const createItem = (data, property = false) => {
	const keyBase = property ? "property" : "column"
	let keyIndex = data.id
	let key = "" + keyBase + "_" + keyIndex
	const buffer = data.buffer
	for(let n = 0; (n < buffer.length); n++) {
		const item = buffer[n].item
		if((item.key === key)) {
			keyIndex++
			key = "" + keyBase + "_" + keyIndex
			n = 0
			continue
		}
	}
	const item = {
		key: key,
		type: "String"
	}
	populateFromSchemaType(item)
	const itemData = new SchemaData(data.id++, item)
	return itemData
}
const rebuildBufferItem = (schemaCache, type) => {
	const itemNew = {
		key: schemaCache.item.key,
		type: type
	}
	populateFromSchemaType(itemNew)
	schemaCache.item = itemNew
	switch(type) {
		case "List":
		schemaCache.schema = createSchemaCache()
		break

		case "Type":
		schemaCache.schema = []
		break

		default:
		schemaCache.schema = null
		break

	}
}
const createSchemaCache = (schema = null) => {
	const schemaCache = {
		id: 0,
		typeIndex: -1,
		types: null,
		sortKey: null,
		buffer: [],
		props: []
	}
	if(!schema) {
		return schemaCache
	}
	let typeId = 0
	let types = []
	const props = []
	const buffer = schemaCache.buffer
	buffer.length = schema.length
	for(let n = 0; (n < schema.length); n++) {
		const item = schema[n]
		const entry = new SchemaData(n, item)
		buffer[n] = entry
		switch(item.type) {
			case "Type":
			{
				props.push(n)
				types = Object.keys(item.schema)
				entry.schema = []
				const schemas = item.schema
				for(let key in schemas) {
					entry.schema.push({
						id: typeId++,
						type: key,
						schema: createSchemaCache(schemas[key])
					})
				}
			}
			break

			case "List":
			props.push(n)
			entry.schema = createSchemaCache(item.schema)
			break

		}
	}
	schemaCache.id = schema.length
	schemaCache.props = props
	schemaCache.types = types
	return schemaCache
}
const populateSchema = (schemaCache) => {
	const buffer = schemaCache.buffer
	const output = new Array(buffer.length)
	for(let n = 0; (n < buffer.length); n++) {
		const entry = buffer[n]
		const item = entry.item
		output[n] = item
		switch(item.type) {
			case "List":
			item.schema = populateSchema(entry.schema)
			break

			case "Type":
			{
				item.schema = {}
				const schemas = entry.schema
				for(let n = 0; (n < schemas.length); n++) {
					const typeSchema = schemas[n]
					item.schema[typeSchema.type] = populateSchema(typeSchema.schema)
				}
			}
			break

		}
	}
	return output
}
const populateFromSchemaType = (item, copy = null) => {
	const typeSchema = store.data.types[item.type]
	for(let key in typeSchema) {
		const entry = typeSchema[key]
		if(copy) {
			const value = copy[key]
			if((value !== undefined)) {
				item[key] = value
				continue
			}
		}
		item[key] = (entry.value !== undefined) ? entry.value : createDefaultValue(entry, null, null)
	}
	return item
}
const modifyAsset_rowType = (data, key, typeDef) => {
	const typeBuffer = typeDef.schema.buffer
	for(let n = 0; (n < data.length); n++) {
		const item = data[n]
		item[key] = typeDef.type
		for(let m = 0; (m < typeBuffer.length); m++) {
			const schemaItem = typeBuffer[m].item
			item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
		}
	}
}
const modifyAsset_type = (data, schemaItem, prevType = null, typeColumn = null, type = null) => {
	if(typeColumn) {
		for(let n = 0; (n < data.length); n++) {
			const item = data[n]
			if((item[typeColumn] === type)) {
				item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
			}
		}
	}
	else {
		if(prevType) {
			if((schemaItem.type === "UID") && (prevType === "String")) {
				return
			}
		}
		for(let n = 0; (n < data.length); n++) {
			const item = data[n]
			item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
		}
	}
}
const modifyAsset_rename = (data, from, to, typeColumn = null, type = null) => {
	if(typeColumn) {
		for(let n = 0; (n < data.length); n++) {
			const item = data[n]
			if((item[typeColumn] === type)) {
				item[to] = item[from]
				delete item[from]
			}
		}
	}
	else {
		for(let n = 0; (n < data.length); n++) {
			const item = data[n]
			item[to] = item[from]
			delete item[from]
		}
	}
}
const modifyAsset_remove = (data, entry, typeColumn = null, type = null) => {
	const item = entry.item
	const key = item.key
	if(typeColumn) {
		if((item.type === "Type")) {
			for(let n = 0; (n < data.length); n++) {
				const item = data[n]
				if((item[typeColumn] === type)) {
					removeProperties(item, entry, item[key])
					delete item[key]
				}
			}
		}
		else {
			for(let n = 0; (n < data.length); n++) {
				const item = data[n]
				if((item[typeColumn] === type)) {
					delete item[key]
				}
			}
		}
	}
	else {
		if((item.type === "Type")) {
			for(let n = 0; (n < data.length); n++) {
				const item = data[n]
				removeProperties(item, entry, item[key])
				delete item[key]
			}
		}
		else {
			for(let n = 0; (n < data.length); n++) {
				const item = data[n]
				delete item[key]
			}
		}
	}
}
const modifyAsset_typeRename = (asset, key, type, typePrev) => {
	for(let n = 0; (n < asset.length); n++) {
		const item = asset[n]
		if((item[key] === typePrev)) {
			item[key] = type
		}
	}
}
const removeProperties = (item, entry, type) => {
	const typeSchema = entry.schema.find((src) => (src.type === type))
	const buffer = typeSchema.schema.buffer
	for(let n = 0; (n < buffer.length); n++) {
		const bufferItem = buffer[n].item
		delete item[bufferItem.key]
	}
}
const createDefaultValue = (schemaItem, data, key) => {
	switch(schemaItem.type) {
		case "UID":
		return "uid"

		case "GUID":
		return Utils.uuid4()

		case "String":
		return "Key"

		case "Number":
		return 0

		case "Float":
		return 0.0

		case "Boolean":
		return false

		case "List":
		return []

		case "Type":
		case "Schema":
		return null

	}
	return null
}
const createRow = (data, schema, typeSchemaIndex = 0) => {
	const row = {}
	const buffer = schema.buffer
	for(let n = 0; (n < buffer.length); n++) {
		const item = buffer[n].item
		if((data[item.key] !== undefined)) {
			row[item.key] = data[item.key]
		}
		else {
			row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
		}
	}
	if((schema.typeIndex > -1)) {
		const entry = buffer[schema.typeIndex]
		if((entry.schema.length > 0)) {
			const typeDefault = entry.schema[typeSchemaIndex]
			const typeBuffer = typeDefault.schema.buffer
			for(let n = 0; (n < typeBuffer.length); n++) {
				const item = typeBuffer[n].item
				row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
			}
			row[entry.item.key] = typeDefault.type
		}
	}
	row.__cache = createCache()
	return row
}
const rebuildRow = (path, schema) => {
	const data = store.get(path)
	const entry = schema.buffer[schema.typeIndex]
	const typeSchemaIndex = schema.types.indexOf(data[entry.item.key])
	const row = createRow(data, schema, typeSchemaIndex)
	row.__cache = data.__cache
	store.set(path, row)
}
const isKeyUnique = (schema, key) => {
	for(let schemaKey in schema) {
		if((schemaKey === key)) {
			return false
		}
	}
	return true
}
const moveBefore = (buffer, index, indexBefore) => {
	const item = buffer.splice(index, 1)
	buffer.splice(indexBefore, 0, item[0])
	for(let n = 0; (n < buffer.length); n++) {
		buffer[n].index = n
	}
}
const loadBuffer = (asset) => {
	if((asset.meta.type !== "Sheet")) {
		return
	}
	const schema = asset.cache.schema
	let idKey = null
	for(let n = 0; (n < schema.length); n++) {
		const entry = schema[n]
		if((entry.type === "UID") || (entry.type === "GUID")) {
			idKey = entry.key
			break
		}
	}
	if(idKey) {
		const data = asset.data
		const buffer = new Array(data.length)
		for(let n = 0; (n < data.length); n++) {
			const item = data[n]
			buffer[n] = item[idKey]
		}
		buffer.sort(sortKey)
		store.set("buffers/" + asset.meta.id, buffer)
	}
}
const unloadBuffer = (asset) => {
	store.remove("buffers/" + asset.meta.id)
}
const updateBuffer = (asset) => {
	if(!asset) {
		return
	}
	loadBuffer(asset)
}
const getNamedBuffers = () => {
	const named = []
	const buffers = store.data.buffers
	for(let key in buffers) {
		const asset = store.data.assets[key]
		named.push({
			key: asset.meta.name,
			value: asset.meta.id
		})
	}
	return named
}
const emptySchemaCache = {
	schema: createSchemaCache()
}
exports.default = {
	apply: apply,
	createItem: createItem,
	createCache: createCache,
	createSchemaCache: createSchemaCache,
	createDefaultValue: createDefaultValue,
	createRow: createRow,
	isKeyUnique: isKeyUnique,
	moveBefore: moveBefore,
	rebuildBufferItem: rebuildBufferItem,
	rebuildRow: rebuildRow,
	loadBuffer: loadBuffer,
	unloadBuffer: unloadBuffer,
	updateBuffer: updateBuffer,
	getNamedBuffers: getNamedBuffers
}

})(__modules[8] = {})

//# sourceURL=src\service\SchemaService.js

"use strict";

((exports) => {

exports.default = `null`

})(__modules[9] = {})

//# sourceURL=src\fs\FileSystem.js

"use strict";

((exports) => {

const history = []
let index = -1
const execute = (command) => {
	if(((index + 1) < history.length)) {
		history.length = (index + 1)
	}
	index = history.length
	history.push(command)
	command.execute()
}
const undo = () => {
	if((index < 0)) {
		return
	}
	const command = history[index--]
	command.undo()
}
const redo = () => {
	if(((index + 1) >= history.length)) {
		return
	}
	const command = history[++index]
	command.execute()
}
const flush = () => {
	history.length = 0
}
exports.default = {
	execute: execute,
	undo: undo,
	redo: redo,
	flush: flush
}

})(__modules[10] = {})

//# sourceURL=src\Commander.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const SchemaService = __modules[8].default
const FileSystem = __modules[9].default
const Commander = __modules[10].default
const Utils = __modules[7].default
let activeProject = null
const create = () => {
	const createData = store.data.state.project.create
	const data = {
		meta: {
			id: Utils.uuid4(),
			name: createData.name,
			created: Date.now()
		},
		assets: {},
		cache: {
			assets: {
				selected: null,
				opened: null
			},
			export: {
				minify: false,
				production: false,
				named: false
			}
		}
	}
	FileSystem.createDirectory(data.meta.id, (error, path) => {
		if(error) {
			console.error(error)
			createPopupClose()
			return
		}
		FileSystem.write("" + data.meta.id + "/db.json", JSON.stringify(data), (error, path) => {
			if(error) {
				console.error(error)
			}
			createPopupClose()
		})
	})
}
const remove = (id) => {
	FileSystem.removeDirectory(id, (error, path) => {
		if(error) {
			console.error(error)
			return
		}
		store.remove("state/project/data/" + id)
	})
}
const rename = (id, name) => {
	FileSystem.read(path, (error, json) => {
		if(error) {
			console.error(error)
			return
		}
		const data = JSON.parse(json)
		data.meta.name = name
		FileSystem.write("" + id + "/db.json", JSON.stringify(data), (error) => {
			if(error) {
				console.error(error)
				return
			}
		})
	})
}
const open = (id) => {
	if(activeProject) {
		if((activeProject.meta.id === projectId)) {
			return
		}
	}
	location.hash = id
	load()
}
const load = (onLoad) => {
	store.set("state/project/loading", true)
	const url = document.location.hash.slice(1)
	const segments = url.split("/")
	if((url.length > 0)) {
		const projectId = segments[0]
		const assetId = (segments.length > 1) ? segments[1] : null
		if(activeProject) {
			if((activeProject.meta.id === projectId)) {
				return
			}
			unload()
		}
		FileSystem.read("" + projectId + "/db.json", (error, json) => {
			if(error) {
				console.error(error)
				return
			}
			const data = JSON.parse(json)
			store.set("meta", data.meta)
			store.set("assets", data.assets)
			store.set("cache", data.cache)
			activeProject = data
			loadBuffers()
			if(assetId) {
				const asset = store.get("assets/" + assetId)
				if(asset) {
					document.location.hash = "" + projectId + "/" + assetId
					store.set("cache/assets/selected", assetId)
				}
			}
			store.set("state/project/loading", false)
		})
	}
	else {
		document.location.hash = ""
		store.set("state/project/loading", false)
	}
}
const loadBuffers = () => {
	const assets = store.data.assets
	for(let key in assets) {
		const asset = assets[key]
		SchemaService.loadBuffer(asset)
	}
}
const unload = () => {
	save()
	activeProject = null
}
const save = () => {
	if(!activeProject) {
		return
	}
	const rootPath = activeProject.meta.id
	FileSystem.write("" + rootPath + "/db.temp.json", JSON.stringify(activeProject), (error, json) => {
		if(error) {
			console.error(error)
			return
		}
		FileSystem.moveTo("" + rootPath + "/db.temp.json", "" + rootPath + "/db.json", (error) => {
			if(error) {
				console.error(error)
				return
			}
			console.log("saved")
		})
	})
}
const fetch = () => {
	store.set("state/project/loading", true)
	if(!window.electron) {
		FileSystem.readDirectory("", (error, data) => {
			if(error) {
				console.error("(Project.fetch) Error while reading root directory")
				return
			}
			fetchLocal(data, handleFetch)
		})
	}
	else {
		callback({})
	}
}
const fetchLocal = (data, onDone) => {
	const num = data.length
	const projects = {}
	let numToLoad = 0
	if((num > 0)) {
		for(let n = 0; (n < num); n++) {
			const item = data[n]
			if(!item.isDirectory) {
				continue
			}
			const projectDbFile = "" + item.name + "/db.json"
			numToLoad++
			FileSystem.read(projectDbFile, (error, json) => {
				if(error) {
					console.warn("(Project.fetchLocal) Error while reading project db file:", projectDbFile)
				}
				else {
					try {
						const data = JSON.parse(json)
						projects[item.name] = data
					}
					catch(error) {}
				}
				numToLoad--
				if((numToLoad === 0)) {
					if(onDone) {
						onDone(projects)
					}
				}
			})
		}
	}
	else {
		if(onDone) {
			onDone(projects)
		}
	}
}
const handleFetch = (projects) => {
	store.set("state/project/data", projects)
	store.set("state/project/loading", false)
}
const createPopupShow = () => {
	store.set("state/project/create", {
		name: "Project"
	})
}
const createPopupClose = () => {
	store.set("state/project/create", null)
}
const importJson = (json) => {
	try {
		const imported = JSON.parse(json)
		store.set("buffers", {})
		const assets = imported.assets
		for(let key in assets) {
			const asset = assets[key]
			const data = asset.data
			asset.meta.schemaCache = SchemaService.createSchemaCache(asset.meta.schema)
			fillCache(data)
			SchemaService.updateBuffer(asset)
		}
		store.set("assets", imported.assets)
		Commander.flush()
		activeProject = {
			meta: activeProject.meta,
			assets: store.data.assets,
			cache: store.data.cache
		}
		save()
	}
	catch(error) {
		console.error(error)
	}
}
const fillCache = (data) => {
	for(let n = 0; (n < data.length); n++) {
		const item = data[n]
		for(let key in item) {
			const property = item[key]
			if(Array.isArray(property)) {
				fillCache(property)
			}
		}
		item.__cache = SchemaService.createCache()
	}
}
exports.default = {
	create: create,
	remove: remove,
	rename: rename,
	open: open,
	load: load,
	unload: unload,
	save: save,
	fetch: fetch,
	createPopupShow: createPopupShow,
	createPopupClose: createPopupClose,
	importJson: importJson
}

})(__modules[11] = {})

//# sourceURL=src\service\ProjectService.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const elementVoid = __module6.elementVoid
const componentVoid = __module6.componentVoid
const Loader = component({
	render() {
		const color = this.$value
		const props = {
			class: color ? color : ""
		}
		elementOpen("loader", props)
		elementVoid("div")
		elementVoid("div")
		elementVoid("div")
		elementVoid("div")
		elementClose("loader")
	}
})
exports.default = Loader

})(__modules[12] = {})

//# sourceURL=src\component\Loader.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const store = __module6.store
const elementVoid = __module6.elementVoid
const TextInput = component({
	mount() {
		this.props = {
			type: "text",
			onchange: this.handleChange.bind(this)
		}
	},
	render() {
		const element = elementVoid("input", this.props).element
		element.value = this.$value
	},
	handleChange(event) {
		this.$value = event.srcElement.value
	}
})
exports.default = TextInput

})(__modules[13] = {})

//# sourceURL=src\component\TextInput.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const selectElementContents = __module6.selectElementContents
const Word = component({
	state: {
		value: null,
		editable: true,
		editing: false,
		onchange: null
	},
	mount() {
		this.attr = {
			class: "invisible-scrollbar",
			spellcheck: false,
			onclick: this.handleClick.bind(this),
			ondblclick: this.handleDblClick.bind(this),
			onkeydown: this.handleKeyDown.bind(this),
			onblur: this.handleBlur.bind(this)
		}
		this.word = null
	},
	render() {
		let attr
		if(this.$.editing) {
			attr = Object.assign({
				contentEditable: true
			}, this.attr)
		}
		else {
			attr = Object.assign({
				style: {
					textOverflow: "ellipsis"
				}
			}, this.attr)
		}
		this.word = elementOpen("word", attr).element
		this.word.innerHTML = this.$value
		elementClose("word")
		if(this.$.editing) {
			this.word.focus()
			selectElementContents(this.word)
		}
	},
	handleClick(event) {
		if((event.detail % 2)) {}
		else {
			event.stopPropagation()
			if(this.$editable) {
				this.$editing = true
			}
		}
	},
	handleDblClick(event) {
		event.preventDefault()
		event.stopPropagation()
	},
	handleKeyDown(domEvent) {
		const keyCode = domEvent.keyCode
		if((keyCode > 47) && (keyCode < 58) || (keyCode > 64) && (keyCode < 91) || (keyCode > 96) && (keyCode < 123) || (keyCode === 95) || (keyCode === 189) || (keyCode === 190) || (keyCode === 32) || (keyCode === 191)) {
			return
		}
		if((keyCode === 187) || (keyCode === 189)) {
			return
		}
		if((keyCode === 8) || (keyCode == 46)) {
			return
		}
		else if((keyCode >= 37) && (keyCode <= 40)) {
			return
		}
		else if((keyCode === 27)) {
			domEvent.target.blur()
		}
		else if((keyCode === 13)) {
			domEvent.target.blur()
		}
		else if((keyCode === 35) || (keyCode === 36)) {
			return
		}
		domEvent.preventDefault()
	},
	handleBlur(domEvent) {
		const newValue = domEvent.target.innerText.replace(/^\s+|\s+$/g, "").replace(/<\/?[^>]+(>|$)/g, "").replace(/\n/, "")
		if(this.$onchange) {
			this.$value = this.$onchange(newValue)
		}
		else {
			this.$value = newValue
		}
		this.word.scrollLeft = 0
		this.$editing = false
		const selection = window.getSelection()
		selection.removeAllRanges()
	}
})
exports.default = Word

})(__modules[14] = {})

//# sourceURL=src\component\Word.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const elementVoid = __module6.elementVoid
const store = __module6.store
const ProjectService = __modules[11].default
const Loader = __modules[12].default
const TextInput = __modules[13].default
const Word = __modules[14].default
const Utils = __modules[7].default
const CreateProjectWindow = component({
	mount() {
		this.propsCreate = {
			class: "green",
			onclick: this.handleCreate.bind(this)
		}
		this.propsClose = {
			onclick: this.handleClose.bind(this)
		}
	},
	render() {
		elementOpen("window")
		elementOpen("header")
		elementOpen("name")
		text("Create Project")
		elementClose("name")
		elementOpen("button", this.propsClose)
		elementVoid("i", {
			class: "fas fa-times"
		})
		elementClose("button")
		elementClose("header")
		elementOpen("content")
		elementOpen("form")
		elementOpen("entry")
		elementOpen("key")
		text("Name")
		elementClose("key")
		elementOpen("value")
		componentVoid(TextInput, {
			bind: "state/project/create/name"
		})
		elementClose("value")
		elementClose("entry")
		elementClose("form")
		elementOpen("buttons")
		elementOpen("button", this.propsCreate)
		text("Create")
		elementClose("button")
		elementClose("buttons")
		elementClose("content")
		elementClose("window")
	},
	handleCreate(event) {
		ProjectService.create()
	},
	handleClose(event) {
		ProjectService.createPopupClose()
	}
})
const ProjectItem = component({
	mount() {
		this.props = {
			onclick: this.handleClick.bind(this)
		}
		this.propsRemove = {
			onclick: this.handleRemove.bind(this)
		}
		this.handleChangeFunc = this.handleChange.bind(this)
	},
	render() {
		elementOpen("item", this.props)
		elementOpen("name")
		componentVoid(Word, {
			bind: "" + this.bind + "/name",
			$onchange: this.handleChangeFunc
		})
		elementClose("name")
		elementOpen("button", this.propsRemove)
		elementVoid("i", {
			class: "fas fa-times"
		})
		elementClose("button")
		elementClose("item")
	},
	handleClick(event) {
		ProjectService.open(this.$value.id)
	},
	handleRemove(event) {
		event.preventDefault()
		event.stopPropagation()
		ProjectService.remove(this.$value.id)
	},
	handleChange(newValue) {
		if(newValue) {
			ProjectService.rename(this.$value.id, newValue)
		}
		return newValue
	}
})
const ProjectWindow = component({
	state: {
		projects: [],
		loading: false
	},
	mount() {
		this.bind = {
			projects: "state/project/data",
			loading: "state/project/loading"
		}
		this.propsCreate = {
			class: "green",
			onclick: this.handleCreate.bind(this)
		}
		ProjectService.fetch()
	},
	render() {
		elementOpen("window")
		elementOpen("header")
		elementOpen("name")
		text("Projects")
		elementClose("name")
		elementClose("header")
		elementOpen("content")
		if(this.$loading) {
			elementOpen("projects", {
				class: "center"
			})
			componentVoid(Loader, {
				$value: "white"
			})
			elementClose("projects")
		}
		else {
			const projects = this.$projects
			if(Utils.hasItems(projects)) {
				elementOpen("projects")
				for(let key in projects) {
					componentVoid(ProjectItem, {
						bind: "" + this.bind.projects + "/" + key + "/meta"
					})
				}
				elementClose("projects")
			}
			else {
				elementOpen("projects", {
					class: "center"
				})
				text("No projects")
				elementClose("projects")
			}
		}
		elementOpen("buttons")
		elementOpen("button", this.propsCreate)
		text("Create")
		elementClose("button")
		elementClose("buttons")
		elementClose("content")
		elementClose("window")
	},
	handleCreate(event) {
		ProjectService.createPopupShow()
	}
})
const ProjectLayout = component({
	mount() {
		this.bind = "state/project/create"
	},
	render() {
		elementOpen("layout", {
			class: "center"
		})
		if(this.$value) {
			componentVoid(CreateProjectWindow)
		}
		else {
			componentVoid(ProjectWindow)
		}
		elementClose("layout")
	}
})
exports.default = ProjectLayout

})(__modules[15] = {})

//# sourceURL=src\layout\ProjectLayout.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const elementVoid = __module6.elementVoid
const LoadingLayout = component({
	render() {
		elementOpen("layout", {
			class: "center"
		})
		elementOpen("loading")
		text("Loading")
		elementClose("loading")
		elementClose("layout")
	}
})
exports.default = LoadingLayout

})(__modules[16] = {})

//# sourceURL=src\layout\LoadingLayout.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const SchemaService = __modules[8].default
class AddRowCommand {
	constructor(path, data, root = false) {
		this.path = path
		this.data = data
		this.root = root
	}
	execute() {
		store.add(this.path, this.data)
		this.updateBuffer()
	}
	undo() {
		const asset = store.get(this.path)
		const index = asset.indexOf(this.data)
		if((index !== -1)) {
			asset.splice(index, 1)
			store.update(this.path)
			this.updateBuffer()
		}
	}
	updateBuffer() {
		if(this.root) {
			const buffer = this.path.split("/")
			const assetPath = buffer.splice(0, (buffer.length - 1)).join("/")
			const asset = store.get(assetPath)
			SchemaService.updateBuffer(asset)
		}
	}
}

exports.default = AddRowCommand

})(__modules[17] = {})

//# sourceURL=src\command\AddRowCommand.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const SchemaService = __modules[8].default
class AddAssetCommand {
	constructor(asset) {
		this.asset = asset
	}
	execute() {
		store.set("assets/" + this.asset.meta.id, this.asset)
		SchemaService.loadBuffer(this.asset)
	}
	undo() {
		store.remove("assets/" + this.asset.meta.id)
		SchemaService.unloadBuffer(this.asset)
	}
}

exports.default = AddAssetCommand

})(__modules[18] = {})

//# sourceURL=src\command\AddAssetCommand.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
class RenameAssetCommand {
	constructor(id, name) {
		this.id = id
		this.name = name
		this.prevName = null
	}
	execute() {
		this.prevName = store.get("assets/" + this.id + "/name")
		store.set("assets/" + this.id + "/name", this.name)
	}
	undo() {
		store.set("assets/" + this.id + "/name", this.prevName)
	}
}

exports.default = RenameAssetCommand

})(__modules[19] = {})

//# sourceURL=src\command\RenameAssetCommand.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
class RemoveAssetCommand {
	constructor(id) {
		this.id = id
		this.asset = null
	}
	execute() {
		this.asset = store.get("assets/" + this.id)
		store.remove("assets/" + this.id)
	}
	undo() {
		store.set("assets/" + this.id, this.asset)
	}
}

exports.default = RemoveAssetCommand

})(__modules[20] = {})

//# sourceURL=src\command\RemoveAssetCommand.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const SchemaService = __modules[8].default
const AddRowCommand = __modules[17].default
const AddAssetCommand = __modules[18].default
const RenameAssetCommand = __modules[19].default
const RemoveAssetCommand = __modules[20].default
const Commander = __modules[10].default
const Utils = __modules[7].default
const open = (assetId) => {
	const newAsset = store.get("assets/" + assetId)
	const openedPrev = store.get("cache/assets/opened")
	const openedAsset = store.get("assets/" + openedPrev)
	if((openedAsset !== newAsset)) {
		SchemaService.updateBuffer(openedAsset)
	}
	if((newAsset.meta.type === "Folder")) {
		store.set("assets/" + assetId + "/cache/open", !newAsset.cache.open)
	}
	else {
		store.set("cache/assets/opened", assetId)
		location.hash = "" + store.data.meta.id + "/" + assetId
	}
}
const close = (assetId) => {}
const select = (assetId) => {
	store.set("cache/assets/selected", assetId)
}
const add = (type) => {
	const asset = create(type)
	Commander.execute(new AddAssetCommand(asset))
}
const remove = (assetId) => {
	Commander.execute(new RemoveAssetCommand(assetId))
	if((store.data.cache.assets.selected === assetId)) {
		document.location.hash = assetId
	}
}
const create = (type) => {
	const asset = {
		meta: {
			id: Utils.uuid4(),
			name: type,
			type: type
		},
		data: [],
		cache: createCache(type)
	}
	return asset
}
const createCache = (type) => {
	switch(type) {
		case "Sheet":
		return {
			schema: [],
			schemaCache: SchemaService.createSchemaCache(),
			sortKey: null,
			sortAsc: true
		}

		case "Folder":
		return {
			open: false
		}

	}
	return null
}
const addRow = (id) => {
	const assetPath = "assets/" + id
	const asset = store.get(assetPath)
	const row = SchemaService.createRow(asset.data, asset.cache.schemaCache)
	Commander.execute(new AddRowCommand("" + assetPath + "/data", row, true))
}
const closeAll = (id) => {
	const assetPath = "assets/" + id
	const asset = store.get(assetPath)
	closeAllArray(asset.data)
	store.update(assetPath)
}
const closeAllArray = (array) => {
	for(let n = 0; (n < array.length); n++) {
		const item = array[n]
		for(let keyId in item) {
			const keyItem = item[keyId]
			if(Array.isArray(keyItem)) {
				closeAllArray(keyItem)
			}
		}
		item.__cache.open = false
	}
}
const sort = (dataPath, cachePath, sortKey, type) => {
	const data = store.get(dataPath)
	const cache = store.get(cachePath)
	if((cache.sortKey === sortKey)) {
		cache.sortAsc = !cache.sortAsc
	}
	else {
		cache.sortKey = sortKey
	}
	switch(type) {
		case "Boolean":
		case "Number":
		case "Float":
		{
			if(cache.sortAsc) {
				data.sort((a, b) => {
					return (a[sortKey] - b[sortKey])
				})
			}
			else {
				data.sort((a, b) => {
					return (b[sortKey] - a[sortKey])
				})
			}
		}
		break

		case "GUID":
		{
			if(cache.sortAsc) {
				data.sort((a, b) => {
					return a[sortKey].localeCompare(b[sortKey], "en", {
						sensitivity: 'base',
						numeric: false
					})
				})
			}
			else {
				data.sort((a, b) => {
					return b[sortKey].localeCompare(a[sortKey], "en", {
						sensitivity: 'base',
						numeric: false
					})
				})
			}
		}
		break

		default:
		{
			if(cache.sortAsc) {
				data.sort((a, b) => {
					return a[sortKey].localeCompare(b[sortKey], "en", {
						sensitivity: "base",
						numeric: true
					})
				})
			}
			else {
				data.sort((a, b) => {
					return b[sortKey].localeCompare(a[sortKey], "en", {
						sensitivity: "base",
						numeric: true
					})
				})
			}
		}
		break

	}
	closeAllArray(data)
	store.update(dataPath)
	store.update("" + cachePath + "/sortKey")
	store.update("" + cachePath + "/sortAsc")
}
exports.default = {
	open: open,
	add: add,
	select: select,
	create: create,
	remove: remove,
	addRow: addRow,
	closeAll: closeAll,
	sort: sort
}

})(__modules[21] = {})

//# sourceURL=src\service\AssetService.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const openPopup = (title, renderFunc) => {
	store.set("state/popup", {
		title: title,
		renderFunc: renderFunc
	})
}
const closePopup = () => {
	store.set("state/popup", null)
}
exports.default = {
	openPopup: openPopup,
	closePopup: closePopup
}

})(__modules[22] = {})

//# sourceURL=src\service\PopupService.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const menus = {}
class MenuDef {
	constructor(menu, extend) {
		this.menu = menu
		this.extend = extend
	}
}

const register = (id, extend, menu) => {
	if(!menu) {
		menu = extend
		extend = null
	}
	if(extend) {
		menus[id] = new MenuDef(menu, extend)
	}
	else {
		menus[id] = new MenuDef(menu, extend)
	}
}
const get = (id) => {
	const def = menus[id]
	if(!def) {
		return null
	}
	let menu = def.menu
	if(def.extend) {
		menu = extend([], def)
	}
	if(menu) {
		sort(menu)
	}
	return menu || null
}
const extend = (menu, def) => {
	const menuExtends = def.extend
	if(menuExtends) {
		if(Array.isArray(menuExtends)) {
			for(let n = 0; (n < menuExtends.length); n++) {
				const menuExtend = menuExtends[n]
				const defExtend = menus[menuExtend]
				if(!defExtend) {
					console.warn("(Menu.extend) Menu not defined: " + menuExtend)
				}
				else {
					menu = extend(menu, defExtend)
				}
			}
		}
		else {
			const defExtend = menus[menuExtends]
			if(!defExtend) {
				console.warn("(Menu.extend) Menu not defined: " + menuExtends)
			}
			else {
				menu = extend(menu, defExtend)
			}
		}
	}
	const maxIndex = menu.length
	const extendMenu = def.menu
	for(let n = 0; (n < extendMenu.length); n++) {
		const extendItem = extendMenu[n]
		let found = false
		for(let i = 0; (i < maxIndex); i++) {
			const item = menu[n]
			if((item.name === extendItem.name)) {
				const newItem = Object.assign({}, extendItem)
				if(item.children) {
					newItem.children = item.children.concat(extendItem.children)
				}
				menu[n] = newItem
				found = true
				break
			}
		}
		if(!found) {
			menu.push(extendItem)
		}
	}
	return menu
}
const sort = (menu) => {
	menu.sort(sortByIndex)
	for(let n = 0; (n < menu.length); n++) {
		const item = menu[n]
		if(item.children && Array.isArray(item.children)) {
			sort(item.children)
		}
	}
}
const sortByIndex = (a, b) => {
	if((a.index === undefined)) {
		return b.index
	}
	if((b.index === undefined)) {
		return a.index
	}
	return (b.index - a.index)
}
const show = (id, data, event, x, y) => {
	const menuProps = get(id)
	if(!menuProps) {
		return false
	}
	const contextmenu = store.data.state.contextmenu
	contextmenu.x = (x !== undefined) ? x : event.x
	contextmenu.y = (y !== undefined) ? y : event.y
	contextmenu.data = data
	contextmenu.props = menuProps
	contextmenu.visible = true
	store.update("state/contextmenu")
	event.preventDefault()
	event.stopPropagation()
}
const hide = () => {
	store.set("state/contextmenu/visible", false)
}
exports.default = {
	register: register,
	show: show,
	hide: hide
}

})(__modules[23] = {})

//# sourceURL=src\service\MenuService.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const store = __module6.store
const elementVoid = __module6.elementVoid
const Caret = component({
	mount() {
		this.props = {
			onclick: this.handleChange.bind(this)
		}
	},
	render() {
		elementOpen("caret", this.props)
		if(this.$value) {
			elementVoid("i", {
				class: "fas fa-caret-down"
			})
		}
		else {
			elementVoid("i", {
				class: "fas fa-caret-right"
			})
		}
		elementClose("caret")
	},
	handleChange(event) {
		this.$value = !this.$value
	}
})
exports.default = Caret

})(__modules[24] = {})

//# sourceURL=src\component\Caret.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const store = __module6.store
const elementVoid = __module6.elementVoid
const Checkbox = component({
	mount() {
		this.props = {
			type: "checkbox",
			onchange: this.handleChange.bind(this)
		}
	},
	render() {
		const element = elementVoid("input", this.props).element
		element.checked = this.$value
	},
	handleChange(event) {
		this.$value = event.srcElement.checked
	}
})
exports.default = Checkbox

})(__modules[25] = {})

//# sourceURL=src\component\Checkbox.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const store = __module6.store
const elementVoid = __module6.elementVoid
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
			onchange: this.handleChangeFunc
		}).element
		element.value = this.$value
	},
	handleChange(event) {
		this.$value = parseInt(event.srcElement.value)
	}
})
exports.default = NumberInput

})(__modules[26] = {})

//# sourceURL=src\component\NumberInput.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const store = __module6.store
const elementVoid = __module6.elementVoid
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
			onchange: this.handleChangeFunc
		}).element
		element.value = this.$value
	},
	handleChange(event) {
		this.$value = parseFloat(event.srcElement.value)
	}
})
exports.default = FloatInput

})(__modules[27] = {})

//# sourceURL=src\component\FloatInput.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const store = __module6.store
const element = __module6.element
const elementVoid = __module6.elementVoid
const Select = component({
	state: {
		value: null,
		src: null,
		onChange: null
	},
	mount() {
		this.props = {
			onchange: this.handleChange.bind(this)
		}
	},
	render() {
		const options = this.$src
		if(!options) {
			elementVoid("select")
			return
		}
		elementOpen("select", this.props)
		if((options.length > 0)) {
			const keyPair = (typeof options[0] === "object") ? true : false
			if(keyPair) {
				if(!this.$value || !options.find((item) => (item.value === this.$value)) || (options.length === 1) && (options[0] !== this.$value)) {
					this.$value = options[0].value
				}
				for(let n = 0; (n < options.length); n++) {
					const option = options[n]
					const props = (this.$value === option.value) ? {
						value: option.value,
						selected: true
					} : {
						value: option.value
					}
					elementOpen("option", props)
					text(option.key)
					elementClose("option")
				}
			}
			else {
				if(!this.$value || (options.indexOf(this.$value) === -1) || (options.length === 1) && (options[0] !== this.$value)) {
					this.$value = options[0]
				}
				for(let n = 0; (n < options.length); n++) {
					const option = options[n]
					const props = (this.$value === option) ? {
						value: option,
						selected: true
					} : {
						value: option
					}
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
exports.default = Select

})(__modules[28] = {})

//# sourceURL=src\component\Select.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const SchemaService = __modules[8].default
class RemoveRowCommand {
	constructor(path, data) {
		this.path = path
		this.data = data
	}
	execute() {
		const asset = store.get(this.path)
		const index = asset.indexOf(this.data)
		if((index !== -1)) {
			asset.splice(index, 1)
			store.update(this.path)
		}
	}
	undo() {
		const asset = store.get(this.path)
		store.add(this.path, this.data)
	}
}

exports.default = RemoveRowCommand

})(__modules[29] = {})

//# sourceURL=src\command\RemoveRowCommand.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const elementVoid = __module6.elementVoid
const text = __module6.text
const store = __module6.store
const Caret = __modules[24].default
const Checkbox = __modules[25].default
const Word = __modules[14].default
const NumberInput = __modules[26].default
const FloatInput = __modules[27].default
const Select = __modules[28].default
const SchemaService = __modules[8].default
const AssetService = __modules[21].default
const Commander = __modules[10].default
const AddRowCommand = __modules[17].default
const RemoveRowCommand = __modules[29].default
const propsCaret = {
	class: "caret"
}
const propsFieldButton = {
	class: "button"
}
const propsFieldType = {
	class: "input"
}
const findSchema = (schema, type) => {
	for(let n = 0; (n < schema.length); n++) {
		const entry = schema[n]
		if((entry.type === type)) {
			return entry.schema.buffer
		}
	}
	return null
}
const SheetList = component({
	state: {
		value: null,
		cache: null,
		key: null,
		schema: null
	},
	mount() {
		this.propsAdd = {
			onclick: this.handleAdd.bind(this)
		}
	},
	render() {
		elementOpen("sheet-list")
		elementOpen("header")
		elementOpen("name")
		text(this.$key)
		elementClose("name")
		elementOpen("button", this.propsAdd)
		elementVoid("i", {
			class: "fas fa-plus"
		})
		elementClose("button")
		elementClose("header")
		componentVoid(Sheet, {
			bind: {
				value: this.bind.value,
				cache: this.bind.cache
			},
			$schema: this.$schema
		})
		elementClose("sheet-list")
	},
	handleAdd(event) {
		const row = SchemaService.createRow(this.$value, this.$schema)
		Commander.execute(new AddRowCommand(this.bind.value, row, false))
	}
})
const SheetRow = component({
	state: {
		value: null,
		cache: null,
		schema: null,
		index: -1
	},
	mount() {
		this.handleSortFunc = this.handleSort.bind(this)
		this.propsRemove = {
			onclick: this.handleRemove.bind(this)
		}
	},
	render() {
		const schema = this.$schema
		const buffer = schema.buffer
		elementOpen("row")
		if((schema.props.length > 0)) {
			elementOpen("field", propsCaret)
			componentVoid(Caret, {
				bind: "" + this.bind.value + "/__cache/open"
			})
			elementClose("field")
		}
		for(let n = 0; (n < buffer.length); n++) {
			const entry = buffer[n]
			if((entry.item.type !== "List")) {
				elementOpen("field", (entry.item.type === "Type") ? propsFieldType : null)
				this.renderValue(entry.item)
				elementClose("field")
			}
		}
		elementOpen("field", propsFieldButton)
		elementOpen("button", this.propsRemove)
		elementVoid("i", {
			class: "fas fa-times"
		})
		elementClose("button")
		elementClose("field")
		elementClose("row")
		if((schema.props.length > 0) && this.$cache.open) {
			const props = schema.props
			elementOpen("properties")
			for(let n = 0; (n < props.length); n++) {
				const entry = buffer[props[n]]
				const entryItem = entry.item
				if((entryItem.type === "Type")) {
					const type = this.$value[entryItem.key]
					if(type) {
						const typeBuffer = findSchema(entry.schema, type)
						for(let n = 0; (n < typeBuffer.length); n++) {
							const entry = typeBuffer[n]
							if((entry.item.type === "List")) {
								this.renderValue(entry.item, entry.schema)
							}
							else {
								elementOpen("property")
								elementOpen("key")
								text(entry.item.key)
								elementClose("key")
								elementOpen("value")
								this.renderValue(entry.item, entry.schema)
								elementClose("value")
								elementClose("property")
							}
						}
					}
				}
				else if((entryItem.type === "List")) {
					this.renderValue(entryItem, entry.schema)
				}
			}
			elementClose("properties")
		}
	},
	renderValue(entry, schema) {
		const key = entry.key
		switch(entry.type) {
			case "String":
			case "UID":
			componentVoid(Word, {
				bind: "" + this.bind.value + "/" + key
			})
			break

			case "Number":
			componentVoid(NumberInput, {
				bind: "" + this.bind.value + "/" + key,
				$min: entry.min,
				$max: entry.max
			})
			break

			case "Float":
			componentVoid(FloatInput, {
				bind: "" + this.bind.value + "/" + key,
				$min: entry.min,
				$max: entry.max,
				$step: entry.step
			})
			break

			case "Boolean":
			componentVoid(Checkbox, {
				bind: "" + this.bind.value + "/" + key
			})
			break

			case "List":
			componentVoid(SheetList, {
				bind: {
					value: "" + this.bind.value + "/" + entry.key,
					cache: "" + this.bind.value + "/__cache"
				},
				$key: entry.key,
				$schema: schema
			})
			break

			case "Reference":
			componentVoid(Select, {
				bind: "" + this.bind.value + "/" + key,
				$src: store.data.buffers[entry.sheet]
			})
			break

			case "Type":
			componentVoid(Select, {
				bind: "" + this.bind.value + "/" + key,
				$src: this.$schema.types,
				$onChange: () => {
					SchemaService.rebuildRow(this.bind.value, this.$schema)
				}
			})
			break

			default:
			text(this.$value[key])
			break

		}
	},
	handleSort(event) {
		const key = event.currentTarget.dataset.key
		console.log(key)
	},
	handleRemove(event) {
		if(confirm("Are you sure you want to delete this row?")) {
			const buffer = this.bind.value.split("/")
			const path = buffer.slice(0, (buffer.length - 1)).join("/")
			Commander.execute(new RemoveRowCommand(path, this.$value))
		}
	}
})
const Sheet = component({
	state: {
		value: null,
		schema: null,
		cache: null
	},
	mount() {
		this.handleSortFunc = this.handleSort.bind(this)
		this.itemCount = 0
	},
	render() {
		const items = this.$value
		const schema = this.$schema
		const cache = this.$cache
		const buffer = schema.buffer
		if((this.itemCount === 0)) {
			this.itemCount = items.length
		}
		elementOpen("sheet")
		elementOpen("head")
		if((schema.props.length > 0)) {
			elementOpen("field", propsCaret)
			elementClose("field")
		}
		for(let n = 0; (n < buffer.length); n++) {
			const entry = buffer[n]
			if((entry.item.type !== "List")) {
				elementOpen("field", {
					"data-key": entry.item.key,
					"data-type": entry.item.type,
					class: (entry.item.type === "Type") ? "input" : null,
					onclick: this.handleSortFunc
				})
				text(entry.item.key)
				if((entry.item.key === cache.sortKey)) {
					elementOpen("sort")
					elementVoid("i", {
						class: cache.sortAsc ? "fas fa-angle-down" : "fas fa-angle-up"
					})
					elementClose("sort")
				}
				elementClose("field")
			}
		}
		elementVoid("field", propsFieldButton)
		elementClose("head")
		const element = elementOpen("content").element
		for(let n = 0; (n < items.length); n++) {
			componentVoid(SheetRow, {
				bind: {
					value: "" + this.bind.value + "/" + n,
					cache: "" + this.bind.value + "/" + n + "/__cache"
				},
				$schema: schema,
				$index: n
			})
		}
		elementClose("content")
		if((this.itemCount !== items.length)) {
			element.scrollTop = element.scrollHeight
		}
		elementClose("sheet")
	},
	handleSort(event) {
		const key = event.currentTarget.dataset.key
		const type = event.currentTarget.dataset.type
		AssetService.sort(this.bind.value, this.bind.cache, key, type)
	}
})
exports.default = Sheet

})(__modules[30] = {})

//# sourceURL=src\component\Sheet.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const elementVoid = __module6.elementVoid
const PopupService = __modules[22].default
const Popups = component({
	mount() {
		this.bind = "state/popup"
		this.handleCloseFunc = this.handleClose.bind(this)
	},
	render() {
		const popup = this.$value
		if(popup) {
			elementOpen("back")
			elementOpen("window")
			elementOpen("header")
			elementOpen("name")
			text(popup.title)
			elementClose("name")
			elementOpen("button", {
				onclick: this.handleCloseFunc
			})
			elementVoid("i", {
				class: "fas fa-times"
			})
			elementClose("button")
			elementClose("header")
			elementOpen("content")
			popup.renderFunc()
			elementClose("content")
			elementClose("window")
			elementClose("back")
		}
	},
	handleClose(event) {
		PopupService.closePopup()
	}
})
exports.default = Popups

})(__modules[31] = {})

//# sourceURL=src\component\Popups.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const elementVoid = __module6.elementVoid
const text = __module6.text
const store = __module6.store
const element = __module6.element
const SchemaService = __modules[8].default
const PopupService = __modules[22].default
const TextInput = __modules[13].default
const NumberInput = __modules[26].default
const Select = __modules[28].default
const Checkbox = __modules[25].default
const Caret = __modules[24].default
const Word = __modules[14].default
const TypeBuilder = component({
	mount() {
		this.propsAdd = {
			onclick: this.handleAdd.bind(this)
		}
		this.handleRemoveFunc = this.handleRemove.bind(this)
	},
	render() {
		const list = this.$value
		elementOpen("builder")
		elementOpen("button", this.propsAdd)
		text("Add")
		elementClose("button")
		elementOpen("list")
		for(let n = 0; (n < list.length); n++) {
			elementOpen("item")
			elementOpen("row")
			elementOpen("name")
			componentVoid(Word, {
				bind: "" + this.bind + "/" + n + "/type"
			})
			elementClose("name")
			elementOpen("button", {
				"data-index": n,
				onclick: this.handleRemoveFunc
			})
			text("Remove")
			elementClose("button")
			elementClose("row")
			componentVoid(Schema, {
				bind: {
					value: "" + this.bind + "/" + n,
					schema: "" + this.bind + "/" + n + "/schema",
					buffer: "" + this.bind + "/" + n + "/schema/buffer"
				},
				$child: true
			})
			elementClose("item")
		}
		elementClose("list")
		elementClose("builder")
	},
	handleAdd(event) {
		const schema = SchemaService.createSchemaCache()
		this.$value.push({
			type: "Type",
			schema: schema
		})
		this.updateAll()
	},
	handleRemove(event) {
		const index = event.currentTarget.dataset.index
		store.remove("" + this.bind + "/" + index)
	}
})
const SchemaBuilder = component({
	render() {
		elementOpen("builder")
		componentVoid(Schema, {
			bind: {
				schema: "" + this.bind,
				buffer: "" + this.bind + "/buffer"
			}
		})
		elementClose("builder")
	}
})
const EnumBuilder = component({
	render() {
		elementOpen("builder")
		elementOpen("button")
		text("Add")
		elementClose("button")
		elementClose("builder")
	}
})
const SchemaItem = component({
	state: {
		value: null,
		item: null,
		cache: null,
		index: -1,
		onDrop: null
	},
	mount() {
		this.handleChangeFunc = this.handleChange.bind(this)
		this.propsRemove = {
			onclick: this.handleRemove.bind(this)
		}
	},
	render() {
		const props = {
			draggable: "true",
			ondragstart: this.handleDrag.bind(this),
			ondrop: this.handleDrop.bind(this),
			ondragover: this.handleDragOver.bind(this)
		}
		const propsRow = {
			style: {
				width: "50%"
			}
		}
		elementOpen("row", props)
		elementOpen("field", {
			class: "button"
		})
		componentVoid(Caret, {
			bind: "" + this.bind.cache + "/open"
		})
		elementClose("field")
		elementOpen("field", propsRow)
		componentVoid(TextInput, {
			bind: "" + this.bind.item + "/key"
		})
		elementClose("field")
		elementOpen("field", propsRow)
		componentVoid(Select, {
			bind: {
				value: "" + this.bind.item + "/type",
				src: "column-types"
			},
			$onChange: this.handleChangeFunc
		})
		elementClose("field")
		elementOpen("field", {
			class: "button"
		})
		elementOpen("button", this.propsRemove)
		elementVoid("i", {
			class: "fas fa-times"
		})
		elementClose("button")
		elementClose("field")
		elementClose("row")
		if(this.$cache.open) {
			elementOpen("properties", {
				class: "open"
			})
			elementVoid("field")
			elementOpen("field")
			elementOpen("list")
			this.renderType()
			elementClose("list")
			elementClose("field")
			elementClose("properties")
		}
	},
	renderType() {
		const typeSchema = store.data.types[this.$value.item.type]
		for(let key in typeSchema) {
			const entry = typeSchema[key]
			elementOpen("item")
			if((entry.type !== "Type") && (entry.type !== "Schema")) {
				elementOpen("key")
				text(key)
				elementClose("key")
			}
			elementOpen("value")
			switch(entry.type) {
				case "Number":
				componentVoid(NumberInput, {
					bind: "" + this.bind.item + "/" + key
				})
				break

				case "Float":
				componentVoid(NumberInput, {
					bind: "" + this.bind.item + "/" + key
				})
				break

				case "String":
				componentVoid(TextInput, {
					bind: "" + this.bind.item + "/" + key
				})
				break

				case "Boolean":
				componentVoid(Checkbox, {
					bind: "" + this.bind.item + "/" + key
				})
				break

				case "Select":
				{
					const value = this.$item[entry.lookup]
					componentVoid(Select, {
						bind: "" + this.bind.item + "/" + key,
						$src: store.get("buffers/" + value)
					})
				}
				break

				case "Sheet":
				componentVoid(Select, {
					bind: "" + this.bind.item + "/" + key,
					$src: SchemaService.getNamedBuffers()
				})
				break

				case "Type":
				componentVoid(TypeBuilder, {
					bind: "" + this.bind.value + "/schema"
				})
				break

				case "Schema":
				componentVoid(SchemaBuilder, {
					bind: "" + this.bind.value + "/schema"
				})
				break

				case "Enum":
				componentVoid(EnumBuilder, {
					bind: "" + this.bind.item + "/" + key
				})
				break

			}
			elementClose("value")
			elementClose("item")
		}
	},
	handleChange(value) {
		SchemaService.rebuildBufferItem(this.$value, value)
		store.update("" + this.bind.value + "/item")
	},
	handleRemove(event) {
		store.remove(this.bind.value)
	},
	handleDrag(event) {
		event.dataTransfer.setData("index", this.$index)
	},
	handleDrop(event) {
		event.preventDefault()
		this.$onDrop(event.dataTransfer.getData("index"), this.$index)
	},
	handleDragOver(event) {
		event.preventDefault()
	}
})
const Schema = component({
	state: {
		value: null,
		schema: null,
		buffer: null,
		child: false,
		root: false
	},
	mount() {
		this.handleAddFunc = this.handleAdd.bind(this)
		this.handleApplyFunc = this.handleApply.bind(this)
		this.handleDropFunc = this.handleDrop.bind(this)
	},
	render() {
		elementOpen("schema")
		elementOpen("buttons")
		elementOpen("button", {
			onclick: this.handleAddFunc
		})
		text("Add Column")
		elementClose("button")
		elementClose("buttons")
		elementOpen("sheet")
		elementOpen("head")
		elementVoid("field", {
			class: "button"
		})
		elementOpen("field")
		text("name")
		elementClose("field")
		elementOpen("field")
		text("type")
		elementClose("field")
		elementVoid("field", {
			class: "button"
		})
		elementClose("head")
		elementOpen("content")
		const buffer = this.$buffer
		for(let n = 0; (n < buffer.length); n++) {
			componentVoid(SchemaItem, {
				bind: {
					value: "" + this.bind.buffer + "/" + n,
					item: "" + this.bind.buffer + "/" + n + "/item",
					cache: "" + this.bind.buffer + "/" + n + "/cache"
				},
				$index: n,
				$onDrop: this.handleDropFunc
			})
		}
		elementClose("content")
		elementClose("sheet")
		if(this.$root) {
			elementOpen("buttons")
			elementOpen("button", {
				class: "green",
				onclick: this.handleApplyFunc
			})
			text("Apply")
			elementClose("button")
			elementClose("buttons")
		}
		elementClose("schema")
	},
	handleAdd(event) {
		store.add(this.bind.buffer, SchemaService.createItem(this.$schema, this.$child))
	},
	handleApply(event) {
		SchemaService.apply(this.$value.id, this.$value.schema)
		PopupService.closePopup()
	},
	handleDrop(index, indexBefore) {
		SchemaService.moveBefore(this.$buffer, index, indexBefore)
		store.update(this.bind.buffer)
	}
})
exports.default = Schema

})(__modules[32] = {})

//# sourceURL=src\component\Schema.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const elementVoid = __module6.elementVoid
const text = __module6.text
const store = __module6.store
const element = __module6.element
const ProjectService = __modules[11].default
const Utils = __modules[7].default
const Menu = component({
	mount() {
		this.bind = "state/menu"
		this.propsUpload = {
			type: "file",
			style: "display: none;",
			onchange: handleChange
		}
	},
	render() {
		elementOpen("menu")
		const uploadElement = elementVoid("input", this.propsUpload).element
		this.renderItem("", "Home")
		this.renderAction("export", () => {
			location.hash = "" + store.data.meta.id + "/#export"
		})
		this.renderAction("Import", () => {
			uploadElement.click()
		})
		elementClose("menu")
	},
	renderItem(key, value) {
		const props = {
			class: (this.$value === key) ? "active" : "",
			href: "#" + key
		}
		elementOpen("a", props)
		text(value)
		elementClose("a")
	},
	renderAction(value, onclick) {
		elementOpen("a", {
			onclick: onclick
		})
		text(value)
		elementClose("a")
	}
})
const handleChange = (event) => {
	const files = event.target.files
	const file = files[0]
	Utils.readFile(file, (json) => {
		ProjectService.importJson(json)
	})
	event.target.value = ""
}
exports.default = Menu

})(__modules[33] = {})

//# sourceURL=src\component\Menu.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const elementVoid = __module6.elementVoid
const text = __module6.text
const MenuService = __modules[23].default
const ContextMenuInner = component({
	render() {
		elementOpen("inner")
		const items = this.$value
		if((items.length === 0)) {
			elementOpen("content", {
				class: "centered"
			})
			text("No items")
			elementClose("content")
		}
		else {
			for(let n = 0; (n < items.length); n++) {
				const item = items[n]
				if((item.type === "category")) {
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
		const attr = item.func ? {
			onclick: item.func
		} : null
		elementOpen("item", attr)
		if(item.icon) {
			elementVoid("icon", {
				class: "fa " + item.icon
			})
		}
		text(item.name)
		elementClose("item")
	},
	renderCategory(item) {
		elementOpen("category")
		elementOpen("header")
		text(item.name)
		elementClose("header")
		componentVoid(ContextMenuInner, {
			$value: item.children
		})
		elementClose("category")
	},
	renderMenu(item) {
		const attr = item.func ? {
			onclick: item.func
		} : null
		elementOpen("item", attr)
		if(item.icon) {
			elementVoid("icon", {
				class: "fa " + item.icon
			})
		}
		text(item.name)
		elementVoid("caret", {
			class: "fa fa-caret-right"
		})
		elementOpen("contextmenu")
		if((typeof item.children === "string")) {
			componentVoid(ContextMenuInner, {
				$value: Menu.get(item.children)
			})
		}
		else {
			componentVoid(ContextMenuInner, {
				$value: item.children
			})
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
				left: "" + data.x + "px",
				top: "" + data.y + "px"
			}
		}).element
		componentVoid(ContextMenuInner, {
			$value: data.props
		})
		elementClose("contextmenu")
		const rect = element.getBoundingClientRect()
		const bodyRect = document.body.getBoundingClientRect()
		const rightSpaceLeft = (bodyRect.right - rect.right)
		if((rightSpaceLeft < 0)) {
			const newX = ((data.x + rightSpaceLeft) - 10)
			element.style.left = "" + newX + "px"
		}
		const bottomSpaceLeft = (bodyRect.bottom - rect.bottom)
		if((bottomSpaceLeft < 0)) {
			const newY = (data.y + bottomSpaceLeft)
			element.style.top = "" + newY + "px"
		}
	}
})
exports.default = ContextMenu

})(__modules[34] = {})

//# sourceURL=src\component\ContextMenu.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const elementVoid = __module6.elementVoid
const text = __module6.text
const store = __module6.store
const LoadingLayout = __modules[16].default
const AssetService = __modules[21].default
const PopupService = __modules[22].default
const SchemaService = __modules[8].default
const MenuService = __modules[23].default
const Sheet = __modules[30].default
const Popups = __modules[31].default
const Schema = __modules[32].default
const Word = __modules[14].default
const Menu = __modules[33].default
const ContextMenu = __modules[34].default
const Utils = __modules[7].default
const editSchema = (id) => {
	const cache = store.get("assets/" + id + "/cache")
	const schema = SchemaService.createSchemaCache(Utils.cloneObj(cache.schema))
	store.set("cache/schema", {
		id: id,
		schema: schema
	})
	PopupService.openPopup("Edit schema", () => {
		componentVoid(Schema, {
			bind: {
				value: "cache/schema",
				schema: "cache/schema/schema",
				buffer: "cache/schema/schema/buffer"
			},
			$root: true
		})
	})
}
const ContentPanel = component({
	mount() {
		this.handleAddRowFunc = this.handleAddRow.bind(this)
		this.handleEditFunc = this.handleEdit.bind(this)
		this.propsCloseAll = {
			onclick: this.handleCloseAll.bind(this)
		}
	},
	render() {
		const data = this.$value
		elementOpen("panel")
		if(!data) {
			elementOpen("info")
			text("Nothing Selected")
			elementClose("info")
		}
		else {
			elementOpen("header")
			elementOpen("name")
			componentVoid(Word, {
				bind: "" + this.bind + "/meta/name"
			})
			elementClose("name")
			elementOpen("buttons")
			elementOpen("button", {
				onclick: this.handleAddRowFunc
			})
			elementVoid("i", {
				class: "fas fa-plus"
			})
			elementClose("button")
			elementOpen("button", {
				onclick: this.handleEditFunc
			})
			elementVoid("i", {
				class: "fas fa-pen"
			})
			elementClose("button")
			elementOpen("button", this.propsCloseAll)
			elementVoid("i", {
				class: "fas fa-angle-double-up"
			})
			elementClose("button")
			elementClose("buttons")
			elementClose("header")
			elementOpen("content")
			switch(data.meta.type) {
				case "Sheet":
				componentVoid(Sheet, {
					bind: {
						value: "" + this.bind + "/data",
						cache: "" + this.bind + "/cache",
						schema: "" + this.bind + "/cache/schemaCache"
					}
				})
				break

			}
			elementClose("content")
		}
		elementClose("panel")
	},
	handleAddRow(event) {
		AssetService.addRow(this.$value.meta.id)
	},
	handleEdit(event) {
		editSchema(this.$value.meta.id)
	},
	handleCloseAll(event) {
		AssetService.closeAll(this.$value.meta.id)
	}
})
const Asset = component({
	mount() {
		this.handleContextFunc = this.handleContext.bind(this)
		this.propsA = {
			onclick: this.handleSelect.bind(this),
			ondblclick: this.handleOpen.bind(this)
		}
	},
	render() {
		const meta = this.$value
		const icon = store.data.icons[meta.type]
		const props = {
			class: (store.data.cache.assets.selected === meta.id) ? "active" : "",
			oncontextmenu: this.handleContextFunc
		}
		elementOpen("item", props)
		elementVoid("i")
		elementVoid("i", {
			class: icon
		})
		elementOpen("a", this.propsA)
		componentVoid(Word, {
			bind: "" + this.bind + "/name"
		})
		elementClose("a")
		elementClose("item")
	},
	handleSelect(event) {
		AssetService.select(this.$value.id)
	},
	handleOpen(event) {
		AssetService.open(this.$value.id)
	},
	handleContext(event) {
		MenuService.show("assets.item", this.$value.id, event)
	}
})
const Folder = component({
	state: {
		value: null,
		open: false
	},
	mount() {
		this.handleContextFunc = this.handleContext.bind(this)
		this.propsA = {
			onclick: this.handleClick.bind(this)
		}
	},
	render() {
		const meta = this.$value
		const icon = store.data.icons[meta.type]
		const props = {
			class: (store.data.cache.assets.selected === meta.id) ? "active" : "",
			oncontextmenu: this.handleContextFunc
		}
		elementOpen("item", props)
		if(this.$open) {
			elementVoid("i", {
				class: "fas fa-caret-down"
			})
		}
		else {
			elementVoid("i", {
				class: "fas fa-caret-right"
			})
		}
		elementVoid("i", {
			class: icon
		})
		elementOpen("a", this.propsA)
		componentVoid(Word, {
			bind: "" + this.bind.value + "/name"
		})
		elementClose("a")
		elementClose("item")
	},
	handleClick(event) {
		event.preventDefault()
		if((event.detail % 2)) {
			AssetService.select(this.$value.id)
		}
		else {
			AssetService.open(this.$value.id)
		}
	},
	handleContext(event) {
		MenuService.show("assets.item", this.$value.id, event)
	}
})
const AssetPanel = component({
	state: {
		value: null,
		selected: null
	},
	mount() {
		this.bind = {
			value: "assets",
			selected: "cache/assets/selected"
		}
		this.handleAddAssetFunc = this.handleAddAsset.bind(this)
		this.handleContextFunc = this.handleContext.bind(this)
	},
	render() {
		const assets = this.$value
		elementOpen("panel", {
			style: "flex: 240px 0 0;",
			class: "side",
			oncontextmenu: this.handleContextFunc
		})
		elementOpen("header")
		elementOpen("name")
		text("Assets")
		elementClose("name")
		elementOpen("buttons")
		elementOpen("button", {
			onclick: this.handleAddAssetFunc
		})
		elementVoid("i", {
			class: "fas fa-plus"
		})
		elementClose("button")
		elementClose("buttons")
		elementClose("header")
		elementOpen("content")
		elementOpen("list", {
			class: "assets"
		})
		for(let key in assets) {
			const asset = assets[key]
			if((asset.meta.type === "Folder")) {
				componentVoid(Folder, {
					bind: {
						value: "assets/" + asset.meta.id + "/meta",
						open: "assets/" + asset.meta.id + "/cache/open"
					}
				})
			}
			else {
				componentVoid(Asset, {
					bind: "assets/" + asset.meta.id + "/meta"
				})
			}
		}
		elementClose("list")
		elementClose("content")
		elementClose("panel")
	},
	handleAddAsset(event) {
		const currentTarget = event.currentTarget
		const x = (currentTarget.offsetLeft + ((currentTarget.offsetWidth * 0.5) | 0))
		const y = (currentTarget.offsetTop + ((currentTarget.offsetHeight * 0.5) | 0))
		MenuService.show("assets", null, event, x, y)
	},
	handleContext(event) {
		MenuService.show("assets", null, event)
	}
})
const HomeLayout = component({
	state: {
		assetId: null,
		loading: false
	},
	mount() {
		this.bind = {
			assetId: "cache/assets/opened",
			loading: "state/project/loading"
		}
	},
	render() {
		if(this.$loading) {
			componentVoid(LoadingLayout)
		}
		else {
			console.log(this.$assetId)
			elementOpen("layout")
			componentVoid(Menu)
			elementOpen("workspace")
			componentVoid(ContentPanel, {
				bind: "assets/" + this.$assetId
			})
			componentVoid(AssetPanel)
			elementClose("workspace")
			elementClose("layout")
			componentVoid(Popups)
			componentVoid(ContextMenu)
		}
	}
})
exports.default = HomeLayout

})(__modules[35] = {})

//# sourceURL=src\layout\HomeLayout.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const Utils = __modules[7].default
const create = (options) => {
	const data = options.production ? createProduction(options.named) : createProject()
	if(!options.production) {
		data.meta.export = options
		cleanup(data, options)
	}
	if(options.minify) {
		return JSON.stringify(data)
	}
	return JSON.stringify(data, null, "\t")
}
const createProject = () => {
	const data = {
		meta: Utils.cloneObj(store.data.meta),
		assets: Utils.cloneObj(store.data.assets)
	}
	return data
}
const createProduction = (named) => {
	const assets = Utils.cloneObj(store.data.assets)
	const data = {
		meta: Utils.cloneObj(store.data.meta),
		assets: {}
	}
	for(let key in assets) {
		const asset = assets[key]
		const schema = asset.cache.schema
		if(!schema) {
			continue
		}
		let dictionaryKey = null
		for(let n = 0; (n < schema.length); n++) {
			const entry = schema[n]
			if((entry.type === "UID")) {
				dictionaryKey = entry.key
				break
			}
		}
		let buffer = asset.data
		if(dictionaryKey) {
			const dataDictionary = {}
			for(let n = 0; (n < buffer.length); n++) {
				const item = buffer[n]
				dataDictionary[item[dictionaryKey]] = item
				processAssetItem(item, schema)
			}
			buffer = dataDictionary
		}
		else {
			const dataArray = new Array(buffer.length)
			for(let n = 0; (n < buffer.length); n++) {
				const item = buffer[n]
				dataArray[n] = item
				processAssetItem(item, schema)
			}
			buffer = dataArray
		}
		if(named) {
			data.assets[asset.meta.name] = buffer
		}
		else {
			data.assets[key] = buffer
		}
	}
	return data
}
const cleanup = (data, options) => {
	const assets = data.assets
	for(let key in assets) {
		const asset = assets[key]
		const schema = asset.cache.schema
		if(options.production) {
			const data = assets[key]
			for(let n = 0; (n < data.length); n++) {
				processAssetItem(data[n], schema)
			}
		}
		else {
			const asset = assets[key]
			const data = asset.data
			for(let n = 0; (n < data.length); n++) {
				processAssetItem(data[n], schema)
			}
			delete asset.cache.schemaCache
		}
	}
}
const processAssetItem = (item, schema) => {
	delete item.__cache
	for(let n = 0; (n < schema.length); n++) {
		const propertySchema = schema[n]
		switch(propertySchema.type) {
			case "List":
			{
				const properties = item[propertySchema.key]
				const uidKey = getUID(propertySchema.schema)
				if(uidKey) {
					const dict = {}
					item[propertySchema.key] = dict
					for(let n = 0; (n < properties.length); n++) {
						const property = properties[n]
						processAssetItem(property, propertySchema.schema)
						dict[property[uidKey]] = property
					}
				}
				else {
					for(let n = 0; (n < properties.length); n++) {
						processAssetItem(properties[n], propertySchema.schema)
					}
				}
			}
			break

			case "Type":
			{
				const value = item[propertySchema.key]
				processAssetItem(item, propertySchema.schema[value])
			}
			break

		}
	}
}
const getUID = (schema) => {
	for(let n = 0; (n < schema.length); n++) {
		const item = schema[n]
		if((item.type === "UID")) {
			return item.key
		}
	}
	return null
}
exports.default = {
	create: create
}

})(__modules[36] = {})

//# sourceURL=src\service\ExportService.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const component = __module6.component
const componentVoid = __module6.componentVoid
const elementOpen = __module6.elementOpen
const elementClose = __module6.elementClose
const text = __module6.text
const ExportService = __modules[36].default
const Menu = __modules[33].default
const Popups = __modules[31].default
const Checkbox = __modules[25].default
const ExportLayout = component({
	mount() {
		this.bind = "cache/export"
	},
	render() {
		const data = ExportService.create(this.$value)
		elementOpen("layout")
		componentVoid(Menu)
		elementOpen("export")
		elementOpen("toolbar")
		elementOpen("list")
		this.renderCheckbox("minify")
		this.renderCheckbox("production")
		if(this.$value.production) {
			this.renderCheckbox("named")
		}
		elementClose("list")
		elementClose("toolbar")
		elementOpen("content")
		elementOpen("pre")
		text(data)
		elementClose("pre")
		elementClose("content")
		elementClose("export")
		elementClose("layout")
		componentVoid(Popups)
	},
	renderCheckbox(key) {
		elementOpen("item")
		elementOpen("key")
		text(key)
		elementClose("key")
		elementOpen("value")
		componentVoid(Checkbox, {
			bind: "" + this.bind + "/" + key
		})
		elementClose("value")
		elementClose("item")
	}
})
exports.default = ExportLayout

})(__modules[37] = {})

//# sourceURL=src\layout\ExportLayout.js

"use strict";

((exports) => {

const MenuService = __modules[23].default
const AssetService = __modules[21].default
MenuService.register("assets", [ {
	type: "category",
	name: "Create",
	index: 100,
	children: [ {
		name: "Folder",
		icon: "fa-folder",
		func() {
			AssetService.add("Folder")
		}
	}, {
		name: "Sheet",
		icon: "fas fa-database",
		func() {
			AssetService.add("Sheet")
		}
	} ]
} ])
MenuService.register("assets.item", [ {
	name: "actions",
	type: "category",
	children: [ {
		name: "Delete",
		icon: "fa-trash",
		func() {
			if(confirm("Are you sure you want to delete this asset?")) {
				AssetService.remove(store.data.state.contextmenu.data)
			}
		}
	} ]
} ])

})(__modules[38] = {})

//# sourceURL=src\menu\AssetsMenu.js

"use strict";

((exports) => {

const __module6 = __modules[6]
const store = __module6.store
const route = __module6.route
const clearRoutes = __module6.clearRoutes
const ProjectLayout = __modules[15].default
const LoadingLayout = __modules[16].default
const HomeLayout = __modules[35].default
const ExportLayout = __modules[37].default
const ProjectService = __modules[11].default
const MenuService = __modules[23].default
const FileSystem = __modules[9].default
const Commander = __modules[10].default
store.set("buffers", {})
store.set("types", {
	UID: {},
	GUID: {},
	String: {
		default: {
			type: "String",
			value: "Key"
		}
	},
	Number: {
		default: {
			type: "Number",
			value: 0
		},
		min: {
			type: "Number",
			value: Number.MIN_SAFE_INTEGER
		},
		max: {
			type: "Number",
			value: Number.MAX_SAFE_INTEGER
		}
	},
	Float: {
		default: {
			type: "Number",
			value: 0.0
		},
		min: {
			type: "Number",
			value: Number.MIN_VALUE
		},
		max: {
			type: "Number",
			value: Number.MAX_VALUE
		},
		step: {
			type: "Number",
			value: 0.01
		}
	},
	Boolean: {
		default: {
			type: "Boolean",
			value: false
		}
	},
	Reference: {
		sheet: {
			type: "Sheet"
		},
		default: {
			type: "Select",
			src: "buffers",
			lookup: "sheet"
		}
	},
	Type: {
		schema: {
			type: "Type"
		}
	},
	List: {
		schema: {
			type: "Schema"
		}
	},
	Enum: {
		options: {
			type: "Enum"
		}
	}
})
store.set("icons", {
	Folder: "fas fa-folder",
	Sheet: "fas fa-database"
})
store.set("column-types", Object.keys(store.data.types))
store.set("state", {
	project: {
		data: [],
		loading: false,
		create: null
	},
	contextmenu: {
		visible: false,
		x: 0,
		y: 0,
		path: null,
		props: null
	}
})
window.addEventListener("click", (event) => {
	MenuService.hide()
})
window.addEventListener("keydown", (event) => {
	if((event.keyCode === 90) && event.ctrlKey) {
		if(event.shiftKey) {
			Commander.redo()
		}
		else {
			Commander.undo()
		}
	}
})
const init = () => {
	route("", LoadingLayout, null, null, () => {
		FileSystem.init(() => {
			load()
		}, (error) => {
			console.log(error)
		})
	})
}
const load = () => {
	clearRoutes()
	route(/#([0-9a-z]*)\/#export/, ExportLayout, (data) => {})
	route(/#([0-9a-z]*)\/([0-9a-z]*)/, HomeLayout, (data) => {})
	route(/#([0-9a-z]*)/, HomeLayout, (data) => {})
	route("/", ProjectLayout, (data) => {
		ProjectService.unload()
	})
	ProjectService.load()
	window.onbeforeunload = () => {
		ProjectService.unload()
	}
	store.addProxy("", (payload) => {
		store.handle(payload)
		needSave = true
	})
}
init()
let needSave = false
setInterval(() => {
	if(needSave) {
		needSave = false
		ProjectService.save()
	}
}, 500)
window.store = store

})(__modules[39] = {})

//# sourceURL=src\index.js

