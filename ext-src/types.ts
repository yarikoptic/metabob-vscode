import { TextDocument } from 'vscode'

export interface SubmitRepresentationResponse {
  jobId: string
  status: 'complete' | 'pending' | 'running' | 'failed'
  results?: Problem[]
}

export interface Problem {
  id: string
  path: string
  startLine: number
  endLine: number
  category: string
  summary: string
  description: string
}

interface Identity {
  [id: string]: {
    language: string
    filePath: string
    startLine: number
    endLine: number
    text: any
  }
}

interface Node {
  [id: string]: Array<{
    type: 'FILE'
    identity: string
  }>
}

interface Edge {
  [id: string]: any[]
}

export interface SubmitCodeRepresentationPayload {
  format: 'full' | 'partial'
  identities: Identity
  nodes: Node
  edges: Edge
}

export interface IAnalyzeTextDocumentOnSave {
  document: TextDocument
}

export interface CreateSessionRequest {
  apiKey: string
  sessionToken?: string
}

export interface CreateSessionResponse {
  session: string
}

export interface getUserSessionResponse {
  data: null
  status: 200
}

export interface IDocumentMetaData {
  filePath: string
  relativePath: string
  fileContent: string
  isTextDocument: boolean
  languageId: string
  endLine: number
}
