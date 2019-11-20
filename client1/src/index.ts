import { SocketService } from './webclient'
import * as readline from 'readline'
import ClientPToP from './clientptop'

const port: number = 5009
const deviceName: string = 'client 1'
const directory: string = 'C:/Users/Angel/Documents/school stuff/CIS 457/project2/sample1/'

var socket = new SocketService(directory, port, deviceName)
new ClientPToP(directory, port, deviceName)

const readIn = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

main()

function main() {
    readIn.question("", (input) => {
        const arg = removeCommand(input)
        switch (arg[0]) {
            case "disconnect":
                disconnect()
                return
            case "search":
                socket.searchFiles(arg[1])
                break
            case "message":
                socket.sendMessage("message")
                break;
            case "download":
                socket.getDownloadInfo(arg[1])
                break;
            default:
                console.log("invalid response")
        }
        if (input !== null) {
            main()
        }
    })
}

function removeCommand(input: string): string[] {
    var command = ''
    var argument = ''
    let i = 0
    for (; i < input.length; i++) {
        if (input[i] === ' ') {
            break
        }
        command += input[i]
    }
    argument = input.substring(i + 1)
    return [command, argument]
}

function disconnect() {
    console.log("disconnecting")
    readIn.close()
    process.exit()
}
