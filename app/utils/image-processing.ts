export function parsePythonByteString(pyStr: string): Uint8Array {
  // Trim and remove the leading "b'" or 'b"' and the trailing quote.
  let s = pyStr.trim();
  if ((s.startsWith("b'") && s.endsWith("'")) || (s.startsWith('b"') && s.endsWith('"'))) {
    s = s.slice(2, -1);
  }

  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') {
      i++; // Skip the backslash
      if (i >= s.length) break;
      const escChar = s[i];
      if (escChar === 'x') {
        // Handle hex escape: \xNN
        const hexDigits = s.substr(i + 1, 2);
        const value = parseInt(hexDigits, 16);
        bytes.push(value);
        i += 2; // Skip the two hex digits
      } else if (escChar === 'n') {
        bytes.push(10); // newline
      } else if (escChar === 'r') {
        bytes.push(13); // carriage return
      } else if (escChar === 't') {
        bytes.push(9); // tab
      } else if (escChar === '\\') {
        bytes.push(92); // backslash
      } else {
        // For any other escape sequence (e.g. \' or \")
        bytes.push(escChar.charCodeAt(0));
      }
    } else {
      // Normal character, just push its char code.
      bytes.push(s.charCodeAt(i));
    }
  }
  return new Uint8Array(bytes);
}

/** Convert a Uint8Array to base64. */
export function uint8ArrayToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

