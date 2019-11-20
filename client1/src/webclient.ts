import * as socket from 'socket.io-client'
import * as fs from 'fs'
import { RequestMessage, ResponseMessage, User, FileInfo } from './models'

const SERVER_URL = 'http://localhost:5050';

export class SocketService {
    private socket: SocketIOClient.Socket | null = null
    private socketPToP: SocketIOClient.Socket | null = null
    private user: User | null = null
    private directory: string = ''

    constructor(directory: string, port: number, deviceName: string) {
        this.user = {name: deviceName, portNum: port}
        this.directory = directory
        this.connect()
        this.serverListen()
    }

    private connect() {
        this.socket = socket(SERVER_URL)
        const fileList = this.fileList()
        const content: RequestMessage = { from: this.user!, command: "add", argument: fileList}
        this.socket.emit('message', content)
    }

    private serverListen() {
        this.socket!.on('message', (m: ResponseMessage) => {
            switch (m.command) {
                case "list":
                    this.listRecords(m.content!)
                    break;
                case "download":
                    this.startDownload(m.content as any)
                    break;
            }
        })
    }

    private peerListen() {
        this.socketPToP!.on('message', (m: ResponseMessage) => {
            console.log(m)
            if (m.command === 'receiveFile') {
                fs.writeFile(`${this.directory}/${m.content![0]}`, m.content![1], (err) => {
                    if (err) {
                        console.log("failed to download file")
                    }
                    console.log("file saved to: ", this.directory)
                })
            }
        })
    }

    public sendMessage(message: string) {
        this.socket!.emit('message', { from: this.user!, argument: message })
    }

    public searchFiles(message: string) {
        this.socket!.emit('message', { from: this.user!, argument: message, command: 'search'})
    }

    public listRecords(messages: string) {
        if (messages === '') {
            console.log("no results returned")
            return
        }
        console.log("Records: ")
            console.log(messages)
    }

    private startDownload(contents: any) {
        console.log("gathered information: ", contents)
        contents.forEach(async (file: FileInfo) => {   
            console.log  (`http://localhost:${file.portNumber + 10}`)
            this.socketPToP = await socket(`http://localhost:${file.portNumber + 10}`)      
            this.peerListen()
            this.socketPToP!.emit('message', { from: this.user!, argument: file.file, command: 'upload'})
        })
    }

    public getDownloadInfo(messages: string) {
        const list: string[] = messages.split('|')
        this.socket!.emit('message', {from: this.user!, argument: list, command: 'download'})
    }

    private fileList(): string[] {
        const list = fs.readdirSync(this.directory)
        return list
    }
}