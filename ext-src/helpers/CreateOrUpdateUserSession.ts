import * as vscode from 'vscode'
import { getAPIConfig } from '../config'
import { sessionService } from '../services/session/session.service'
import { SessionState } from '../store/session.state'
import { CreateSessionRequest } from '../types'

export async function createOrUpdateUserSession(context: vscode.ExtensionContext) {
  const sessionState = new SessionState(context)
  const apiKey = getAPIConfig()
  const payload: CreateSessionRequest = {
    apiKey: apiKey || ''
  }
  const sessionToken = sessionState.get()
  if (sessionToken) {
    payload['sessionToken'] = sessionToken.value
  }

  const response = await sessionService.createUserSession(payload)

  if (response.isOk()) {
    if (response.value?.session) {
      sessionState.set(response.value?.session)
    }
  }

  if (response.isErr()) {
    if (response.error.response.data.session) {
      sessionState.set(response.error.response.data.session)
    } else {
      return
    }
  }
}
