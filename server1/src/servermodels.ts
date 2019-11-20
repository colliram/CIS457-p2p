export interface User {
    name: string
    portNum?: number
}

export interface Message {
   from: User
   argument?: string | string[]
   command?: string
}

export interface FileInfo {
    portNumber: number
    file: string
}