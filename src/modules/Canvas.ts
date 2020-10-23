import { hasOwn } from '@/utils/hasOwn'

interface InitOptions {
  el: HTMLCanvasElement
  image?: string
  state?: Partial<StateOptions>
}

interface SaveOptions {
  type: 'jpeg'
  query: number
}

export interface StateOptions {
  brightness: number
  contrast: number
  saturate: number
  scale: number
  x: number
  y: number
}

export default class CanvasEditor {
  private static defaultSaveOptions: SaveOptions = {
    type: 'jpeg',
    query: 0.75,
  }

  private static defaultState: StateOptions = {
    brightness: 0,
    contrast: 0,
    saturate: 0,
    scale: 1,
    x: 0,
    y: 0
  }

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private image!: HTMLImageElement

  private state!: StateOptions
  private customState: InitOptions['state'] | undefined = undefined

  constructor (options: InitOptions) {
    this.canvas = options.el
    this.ctx = options.el.getContext('2d')!

    if (typeof options.image === 'string') {
      this.setImage(options.image)
    }

    this.initState(options.state)
    this.initEvent()
  }

  get hasImage () {
    return !!this.image
  }

  get filter () {
    return (
      `brightness(${this.state.brightness + 100}%) `
      + `contrast(${this.state.contrast + 100}%) `
      + `saturate(${this.state.saturate + 100}%)`
    )
  }

  private initState (state: Partial<StateOptions> = {}) {
    const { defaultState } = CanvasEditor
    const states = Object.keys(defaultState) as (keyof StateOptions)[]
    this.customState = state
    this.state = { ...defaultState, ...state }
    
    for (let i = 0, l = states.length; i < l; i++) {
      defineReactive(this.state, states[i], this.drawImage.bind(this))
    }
  }

  /**
   * 初始化事件
   */
  private initEvent () {
    this.dragEvent(),
    this.zoomEvent()
  }

  /**
   * 滑鼠拖曳事件
   */
  private dragEvent () {
    const { documentElement: html } = document
    const { canvas } = this
    let isMouesDown = false
    let startX = 0
    let startY = 0

    const onMouseenter = () => {
      if (isMouesDown) { html.classList.add('cursor-grabbing') }
      html.classList.add('cursor-grab')
    }

    const onMouseleave = () => {
      html.classList.remove(
        'cursor-grab',
        'cursor-grabbing'
      )
    }

    const onMousedown = (e: MouseEvent) => {
      if (isMouesDown) { return }

      html.classList.add('cursor-grabbing')

      startX = e.clientX
      startY = e.clientY

      isMouesDown = true
    }

    const onMouseup = () => {
      if (!isMouesDown) { return }
      html.classList.remove('cursor-grabbing')
      isMouesDown = false
    }

    // 目前有拖曳偏移問題待修正
    const onMousemove = (e: MouseEvent) => {
      if (!isMouesDown) { return }

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      startX = e.clientX
      startY = e.clientY

      this.state.x += dx
      this.state.y += dy
    }
    
    // 滑鼠樣式
    canvas.addEventListener('mouseenter', onMouseenter)
    canvas.addEventListener('mouseleave', onMouseleave)

    // 拖曳
    canvas.addEventListener('mousedown', onMousedown)
    canvas.addEventListener('mouseup', onMouseup)
    canvas.addEventListener('mousemove', onMousemove)

    // 拖曳超出 canvas
    html.addEventListener('mouseup', onMouseup)

    return () => {
      canvas.removeEventListener('mouseenter', onMouseenter)
      canvas.removeEventListener('mouseleave', onMouseleave)

      canvas.removeEventListener('mousedown', onMousedown)
      canvas.removeEventListener('mouseup', onMouseup)
      canvas.removeEventListener('mousemove', onMousemove)

      html.removeEventListener('mouseup', onMouseup)
    }
  } 

  /**
   * 滾輪放大縮小事件
   */
  private zoomEvent () {
    const { canvas } = this
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) { return }
      const { deltaY } = e
      /**
       * 放大縮小
       * 0.9 || 1.1
       */
      const zoom = 1 - (deltaY / Math.abs(deltaY)) * 0.1
      const scale = Math.max(this.state.scale * zoom, 1)

      this.setState('scale', scale)

      e.preventDefault()
    }

    // 縮放
    canvas.addEventListener('wheel', onWheel)

    return () => {
      canvas.removeEventListener('wheel', onWheel)
    }
  }

  /**
   * 將圖片繪製於 canvas 上
   */
  private drawImage () {
    if (!this.hasImage) return
    requestAnimationFrame(() => {
      const { width, height } = this.canvas
      const { scale } = this.state
      this.ctx.filter = this.filter
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(
        this.image,
        this.state.x - (scale - 1) * width * 0.5,
        this.state.y - (scale - 1) * height * 0.5,
        width * scale,
        height * scale
      )
    })
  }

  /**
   * 獲取 image 單例實例
   */
  private getImage () {
    if (this.image) {
      return this.image
    }
    const image = this.image = new Image()
    image.onload = () => {
      this.canvas.width = this.image.width
      this.canvas.height = this.image.height
      this.drawImage()
    }
    image.onerror = () => { throw new Error('圖片有問題!!!') }
    return image
  }

  /**
   * 設定圖片
   * @param {string} src 圖片路徑，注意跨域問題
   */
  public setImage (src: string) {
    this.getImage().src = src
  }

  /**
   * 設定 canvas 輸出屬性
   * @param {String} key 
   * @param {Number} value 
   */
  public setState<T extends keyof StateOptions> (key: T, value: number) {
    if (!hasOwn(this.state, key)) {
      console.error(`state 沒有 ${key} 屬性`)
      return
    }
    this.state[key] = value
  }

  public getState<T extends keyof StateOptions> (key: T) {
    if (!hasOwn(this.state, key)) {
      console.error(`state 沒有 ${key} 屬性`)
      return
    }
    return this.state[key]
  }

  /**
   * 重設圖片
   */
  public resetState () {
    const keys = Object.keys(this.state) as Array<keyof StateOptions>
    const { defaultState } = CanvasEditor
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i]
      this.state[key] = this.customState
        ? this.customState[key] || defaultState[key]
        : defaultState[key]
    }
  }

/**
 * 儲存圖片
 * @param {SaveOptions} options 
 */
  public saveImage (
    {
      type = CanvasEditor.defaultSaveOptions.type,
      query = CanvasEditor.defaultSaveOptions.query,
    }: SaveOptions = CanvasEditor.defaultSaveOptions,
  ) {
    if (!this.hasImage) return
    this.canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${Date.now()}.${type}`
        link.click()
        URL.revokeObjectURL(url)
      },
      `image/${type}`,
      query,
    )
  }
}


// 取自並簡化 Vue 的 defineReactive
// https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js#L135
function defineReactive<T extends {}> (
  obj: T,
  key: keyof T,
  cb?: () => void
) {
  let value = obj[key]

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      return value
    },
    set: function reactiveSetter (newVal) {
      if (newVal === value) {
        return
      }
      value = newVal
      if (typeof cb === 'function') {
        cb()
      }
    }
  })
}
