
const history = []
let index = -1

const execute = (command) => {
    if((index + 1) < history.length) {
        history.length = index + 1
    }
    index = history.length
    history.push(command)
    command.execute()
}

const undo = () => {
    if(index < 0) { return }
    const command = history[index--]
    command.undo()
}

const redo = () => {
    if((index + 1) >= history.length) { return }
    const command = history[++index]
    command.execute()
}

export { execute, undo, redo }