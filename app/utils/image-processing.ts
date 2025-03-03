export function parsePythonByteString(pyStr: string): Uint8Array {
  let s = pyStr

  // Strip leading b' or b"
  if (s.startsWith("b'") && s.endsWith("'")) {
    s = s.slice(2, -1) // remove b' and trailing '
  } else if (s.startsWith('b"') && s.endsWith('"')) {
    s = s.slice(2, -1) // remove b" and trailing "
  }

  // Replace \xNN hex escapes with the corresponding character
  s = s.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => {
    return String.fromCharCode(Number.parseInt(hex, 16))
  })

  // Also replace typical escapes like \n, \r, etc.
  s = s.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\\\/g, "\\")

  // Finally, convert this raw string into a Uint8Array
  const bytes = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) {
    bytes[i] = s.charCodeAt(i)
  }
  return bytes
}

/** Convert a Uint8Array to base64. */
export function uint8ArrayToBase64(buffer: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}

