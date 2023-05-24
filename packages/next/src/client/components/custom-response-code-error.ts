type CustomResponseCodeError = Error & { digest: string } & {
  status?: number
}

export function customResponseCodeError(status: number): never {
  const message = `CUSTOM_RESPONSE_CODE_ERROR-${status}`
  const error = new Error(message)
  ;(error as CustomResponseCodeError).digest = message
  ;(error as CustomResponseCodeError).status = status

  throw error
}

export function isCustomResponseCodeError(
  error: any
): error is Required<CustomResponseCodeError> {
  if (!error?.digest) {
    return false
  }

  const resultCheck = /^CUSTOM_RESPONSE_CODE_ERROR-([\d+]{3})$/g.exec(
    error.digest
  )

  if (!resultCheck) {
    return false
  }

  if (!(error as CustomResponseCodeError).status) {
    ;(error as Required<CustomResponseCodeError>).status = Number(
      resultCheck[1]
    )
  }

  return true
}
