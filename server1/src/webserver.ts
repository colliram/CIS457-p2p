import { createServer, Server } from 'http'
import { Message, User, FileInfo } from './servermodels'
import * as express from 'express'
import * as socketIo from 'socket.io'

export interface User {
    name: string
    portNumber: number
}

export class SocketServer {
    public static readonly PORT: number = 5050
    private app: express.Application | null = null
    private server: Server | null = null
    private io: SocketIO.Server | null = null
    private port: string | number = 0
    private userList: User[] = []
    private files: FileInfo[] = []

    constructor() {
        this.createApp()
        this.config()
        this.createServer()
        this.sockets()
        this.listen()
    }

    private createApp(): void {
        this.app = express()
    }

    private createServer(): void {
        this.server = createServer(this.app!)
    }

    private config(): void {
        this.port = process.env.PORT || SocketServer.PORT
    }

    private sockets(): void {
        this.io = socketIo(this.server)
    }

    private listen(): void {
        this.server!.listen(this.port, () => {
            console.log('Running server on port %s', this.port)
        })
        var user: User
        this.io!.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port)
            socket.on('message', (m: Message) => {
                switch (m.command) {
                    case 'search':
                        const list = this.searchFileRecord(m.from.portNum!, m.argument! as string)
                        socket.emit('message', { command: 'list', from: 'server', content: list })
                        break;
                    case 'add':
                        user = m.from
                        this.userList.push({
                            name: m.from.name,
                            portNum: m.from.portNum || undefined
                        })
                        console.log("Users currently active", this.userList)
                        this.addFiles(m.argument! as string[], m.from.portNum!)
                        break
                    case 'download':
                        const fileInfo = this.collectFileData(m.argument as string[])
                        socket.emit('message', { command: 'download', from: 'server', content: fileInfo })
                }
            })

            socket.on('disconnect', () => {
                console.log('Client disconnected')
                this.userList = this.userList.filter((cl) => cl.name === user.name)
                this.files = this.files.filter((file) => file.portNumber === user.portNum)
                console.log("Users currently active", this.userList)
            })
        })
    }

    private searchFileRecord(user: number, query: string): string {
        var list: string = ''
        this.files.forEach((f) => {
            if (f.file.toLowerCase().includes(query) && f.portNumber !== user) {
                list += (f.file + '\n')
            }
        })
        return list
    }

    private addFiles(list: string[], portNum: number) {
        list.forEach((f) => {
            this.files.push({
                file: f,
                portNumber: portNum
            })
        })
    }

    private collectFileData(items: string[]): FileInfo[] {
        const list: FileInfo[] = []
        items.forEach(element => {
            const file = this.files.find((f) => f.file.toLowerCase() === element.toLowerCase())
            if (file) {
                list.push(file)
            }
        })
        return list
    }

    public getApp(): express.Application {
        return this.app!
    }
}