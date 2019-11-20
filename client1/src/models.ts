export interface User {
    name: string
    portNum?: number
}

export interface RequestMessage {
    from: User
    command: string
    argument?: string | string[]
}

export interface ResponseMessage {
    command: string
    content?: string
    portNumber?: number
}

export interface FileInfo {
    portNumber: number
    file: string
}

export interface Message {
    from: User
    argument?: string | string[]
    command?: string
 }