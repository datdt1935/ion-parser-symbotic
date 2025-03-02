import pako from "pako"

export async function convertToOBJ(modelData: string): Promise<string> {
  try {
    // Decode base64 data
    const binaryData = atob(modelData)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }

    // Decompress the data
    const decompressed = pako.inflate(bytes)
    const decoder = new TextDecoder("utf-8")
    const decompressedStr = decoder.decode(decompressed)

    // Check if the decompressed data is already in OBJ format
    if (decompressedStr.trim().startsWith("# ")) {
      return decompressedStr
    }

    // If not OBJ, try to parse as JSON
    try {
      const meshData = JSON.parse(decompressedStr)
      return convertMeshDataToOBJ(meshData)
    } catch (parseError) {
      console.warn("Failed to parse as JSON, returning decompressed data:", parseError)
      return decompressedStr
    }
  } catch (error) {
    console.error("Error converting to OBJ:", error)
    throw new Error("Failed to convert 3D model data")
  }
}

function convertMeshDataToOBJ(meshData: any): string {
  let objContent = "# Converted 3D Model\n"

  // Add vertices
  if (meshData.vertices) {
    for (let i = 0; i < meshData.vertices.length; i += 3) {
      objContent += `v ${meshData.vertices[i]} ${meshData.vertices[i + 1]} ${meshData.vertices[i + 2]}\n`
    }
  }

  // Add normals if they exist
  if (meshData.normals) {
    for (let i = 0; i < meshData.normals.length; i += 3) {
      objContent += `vn ${meshData.normals[i]} ${meshData.normals[i + 1]} ${meshData.normals[i + 2]}\n`
    }
  }

  // Add texture coordinates if they exist
  if (meshData.uvs) {
    for (let i = 0; i < meshData.uvs.length; i += 2) {
      objContent += `vt ${meshData.uvs[i]} ${meshData.uvs[i + 1]}\n`
    }
  }

  // Add faces
  if (meshData.indices) {
    for (let i = 0; i < meshData.indices.length; i += 3) {
      const v1 = meshData.indices[i] + 1
      const v2 = meshData.indices[i + 1] + 1
      const v3 = meshData.indices[i + 2] + 1

      if (meshData.uvs && meshData.normals) {
        objContent += `f ${v1}/${v1}/${v1} ${v2}/${v2}/${v2} ${v3}/${v3}/${v3}\n`
      } else if (meshData.uvs) {
        objContent += `f ${v1}/${v1} ${v2}/${v2} ${v3}/${v3}\n`
      } else if (meshData.normals) {
        objContent += `f ${v1}//${v1} ${v2}//${v2} ${v3}//${v3}\n`
      } else {
        objContent += `f ${v1} ${v2} ${v3}\n`
      }
    }
  }

  return objContent
}

