import * as vscode from 'vscode'
import { Util } from '../utils'
import { SessionState } from '../store/session.state'
import { handleDocumentAnalyze } from '../helpers/HandleDocumentAnalyze'
import { AnalyzeState } from '../store/analyze.state'
import { CONSTANTS } from '../constants'

export function activateAnalyzeCommand(context: vscode.ExtensionContext, _debug?: vscode.OutputChannel) {
  const command = CONSTANTS.analyzeDocumentCommand

  const commandHandler = async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage(CONSTANTS.editorNotSelectorError)

      return
    }

    if (Util.isValidDocument(editor.document)) {
      const documentMetaData = Util.extractMetaDataFromDocument(editor.document)
      const sessionState = new SessionState(context).get()
      const analyzeState = new AnalyzeState(context)
      let isInQueue = false

      if (sessionState) {
        Util.withProgress<string>(
          handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
          CONSTANTS.analyzeCommandProgressMessage
        ).then(response => {
          if (response === 'in-queue') {
            isInQueue = true
          }
        })

        if (isInQueue) {
          Util.withProgress<string>(
            handleDocumentAnalyze(documentMetaData, sessionState.value, analyzeState),
            CONSTANTS.analyzeCommandQueueMessage
          ).then(response => {
            if (response === 'in-queue') {
              isInQueue = true
            } else if (response === 'success') {
              isInQueue = false
            } else {
              isInQueue = false
            }
          })
        }

        _debug?.appendLine(`Metabob: Analyzed file ${documentMetaData.filePath}`)
      }
    } else {
      vscode.window.showErrorMessage(CONSTANTS.editorSelectedIsInvalid)
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler))
}
