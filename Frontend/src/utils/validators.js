export const validateUrl = (urlString) => {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const isValidCode = (code) => {
  return /^[a-zA-Z0-9_-]+$/.test(code) && code.length >= 5 && code.length <= 10
}