let cacheFileReader!: FileReader
function createFileReader () {
  if (cacheFileReader) {
    return cacheFileReader
  }
  return cacheFileReader = new FileReader()
}

export function loadFile (
  files: FileList,
  cb: (result: string | ArrayBuffer | null) => void
) {
  const fileReader = createFileReader()
  fileReader.onload = (e) => {
    cb(e.target!.result)
  }
  fileReader.readAsDataURL(files[0])
} 