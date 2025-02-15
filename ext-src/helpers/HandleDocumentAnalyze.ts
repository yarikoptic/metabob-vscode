import * as vscode from 'vscode'
import { submitService } from '../services/submit/submit.service'
import { IDocumentMetaData } from '../types'
import { Result } from 'rusty-result-ts'
import { SubmitRepresentationResponse } from '../types'
import { ApiErrorBase } from '../services/base.error'
import { queue } from './Queue'
import { AnalyzeState } from '../store/analyze.state'
import { Util } from '../utils'
import { CONSTANTS } from '../constants'

export const verifyResponseOfSubmit = (response: Result<SubmitRepresentationResponse | null, ApiErrorBase>) => {
  if (response.isErr()) {
    return
  }

  if (response.isOk()) {
    if (response.value?.status === 'complete') {
      return response.value
    } else if (response.value?.status === 'pending' || response.value?.status === 'running') {
      return 'in-queue'
    }
  }

  return
}

export const handleDocumentAnalyze = async (
  metaDataDocument: IDocumentMetaData,
  sessionToken: string,
  analyzeState: AnalyzeState
) => {
  let responseReturn = ''
  const response = await submitService.submitTextFile(
    metaDataDocument.relativePath,
    metaDataDocument.fileContent,
    metaDataDocument.filePath,
    sessionToken
  )

  const verifiedResponse = verifyResponseOfSubmit(response)
  if (!verifiedResponse) {
    vscode.window.showErrorMessage(CONSTANTS.analyzeCommandErrorMessage)

    responseReturn = ''
  }
  if (verifiedResponse === 'in-queue') {
    return 'in-queue'
  } else if (verifiedResponse) {
    if (verifiedResponse.results) {
      const editor = vscode.window.activeTextEditor
      const jobId = verifiedResponse.jobId

      verifiedResponse.results.forEach(problem => {
        analyzeState.set({
          [`${problem.path}@@${problem.id}`]: {
            ...problem,
            isDiscarded: false
          }
        })
      })

      if (editor && editor.document.fileName === metaDataDocument.filePath) {
        const decorationFromResponse = Util.transformResponseToDecorations(verifiedResponse.results, editor, jobId)
        editor.setDecorations(decorationFromResponse.decorationType, [])
        editor.setDecorations(decorationFromResponse.decorationType, decorationFromResponse.decorations)
        return 'success'
      }
    }
  }

  return responseReturn
}
