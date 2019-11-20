import { createServer, Server } from 'http'
import * as express from 'express'
import * as socketIo from 'socket.io'
import * as fs from 'fs'
import { Message } from './models'
import { promisify } from 'util'

export interface User {
    name: string
    portNumber: number
}

export default class ClientPToP {
    public static readonly DEFAULTPORT: number = 5009
    private app: express.Application | null = null
    private server: Server | null = null
    private io: SocketIO.Server | null = null
    private port: number = 0
    private directory: string = ''
    private processName: string = ''

    constructor(directory: string, serverPort: number, name: string) {
        this.directory = directory
        this.port = serverPort
        this.processName = name
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
        this.port += 10
    }

    private sockets(): void {
        this.io = socketIo(this.server)
    }

    private listen(): void {
        this.server!.listen(this.port, () => {
            console.log('Open on port %s', this.port)
        })
        this.io!.on('connect', (socket: any) => {
            socket.on('message', async (m: Message) => {
                console.log(m)
                if (m.command === 'upload') {
                    try {
                    const file = await this.getFile(m.argument as string)
                    socket.emit('message', {
                        command: 'receiveFile',
                        from: this.processName, 
                        content: [m.argument as string, file]
                    })
                }
                catch {
                    console.log("error processing file")
                }
                }
            })
            socket.on('disconnect', () => {
            })
        })
    }

    public getApp(): express.Application {
        return this.app!
    }

    private async getFile(name: string){
        var read = promisify(fs.readFile)
        const file = await read(`${this.directory}${name}`)
        return file
    }
}