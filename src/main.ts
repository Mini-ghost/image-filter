import 'normalize.css'
import '@/assets/scss/main.scss'

import { $, $$ } from '~/utils/selectors'
import { throttle } from '~/utils/throttle'
import CanvasEditor, { StateOptions } from '@/modules/canvas'
import { loadFile } from '@/modules/fileLoader'

const editor = new CanvasEditor({
  el: $<HTMLCanvasElement>('#canvas')!
})

const sliders = $$<HTMLInputElement>('input[type=\'range\']')!
const file = $<HTMLInputElement>('#file')!
const reset = $<HTMLButtonElement>('#reset')!
const download = $<HTMLButtonElement>('#download')!

file.addEventListener('input', (e) => {
  const { files } = e.target! as HTMLInputElement
  if (!files) { return }
  loadFile(files, src => {
    if (!src) { return }
    /^data\:image\//.test(src as string) && editor.setImage(src as string)
  })
})

sliders.forEach(slider => {
  // 設定響應屬性
  const { id } = slider as { id: keyof StateOptions } & HTMLInputElement
  slider.value = `${editor.state[id]}`

  let slideOnChange = ({ target }: Event) => {
    const { value, id } = target as HTMLInputElement
    editor.setState(id as keyof StateOptions, Number(value))
    slider.value = value
  }

  slideOnChange = throttle(slideOnChange)

  slider.addEventListener('change', slideOnChange)
  slider.addEventListener('mousemove', slideOnChange)
})

reset.addEventListener('click', (e) => {
  editor.resetState()
  sliders.forEach(slider => {
    slider.value = `${editor.state[slider.id as keyof StateOptions]}`
  })
  e.preventDefault()
})

// 圖片下載
download.addEventListener('click', (e) => {
  editor.saveImage()
  e.preventDefault()
})
