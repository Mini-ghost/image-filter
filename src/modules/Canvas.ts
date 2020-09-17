interface InitOptions {
  el: HTMLCanvasElement
  image?: string
  state?: StateOptions
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
}

export default class CanvasEditor {
  private static defaultSaveOptions: SaveOptions = {
    type: 'jpeg',
    query: 0.75,
  }

  private static defaultStateOptions: StateOptions = {
    brightness: 0,
    contrast: 0,
    saturate: 0,
    scale: 1
  }

  private _canvas!: HTMLCanvasElement
  private _ctx!: CanvasRenderingContext2D
  private _image!: HTMLImageElement
  private _state!: StateOptions

  private _start = { x: 0, y: 0 }

  constructor (options: InitOptions) {
    this._canvas = options.el
    this._ctx = options.el.getContext('2d')!

    this._state = {
      ...options.state,
      ...CanvasEditor.defaultStateOptions,
    }

    if (typeof options.image === 'string') {
      this.setImage(options.image)
    }

    this.initEventListener()
  }

  get hasImage () {
    return !!this._image
  }

  get filter () {
    return (
      `brightness(${this._state.brightness + 100}%) `
      + `contrast(${this._state.contrast + 100}%) `
      + `saturate(${this._state.saturate + 100}%)`
    )
  }

  get state () {
    return this._state
  }

  set state (state: StateOptions) {
    this._state = state
    this.drawImage()
  }

  /**
   * 初始化事件監聽
   */
  private initEventListener () {
    const { documentElement: html } = document
    const canvas = this._canvas
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

      this._start.x += dx
      this._start.y += dy

      this.drawImage()
    }

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) { return }
      const { deltaY } = e
      /**
       * 放大縮小
       * 0.9 || 1.1
       */
      const zoom = 1 - (deltaY / Math.abs(deltaY)) * 0.1
      const scale = Math.max(this._state.scale * zoom, 1)

      this.setState('scale', scale)

      e.preventDefault()
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

    // 縮放
    canvas.addEventListener('wheel', onWheel)
  } 

  /**
   * 將圖片繪製於 canvas 上
   */
  private drawImage () {
    if (!this.hasImage) return
    requestAnimationFrame(() => {
      const { width, height } = this._canvas
      const { scale } = this._state
      this._ctx.filter = this.filter
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
      this._ctx.drawImage(
        this._image,
        this._start.x - (scale - 1) * width * 0.5,
        this._start.y - (scale - 1) * height * 0.5,
        width * scale,
        height * scale
      )
    })
  }

  /**
   * 獲取 image 單例實例
   */
  private getImage () {
    if (this._image) {
      return this._image
    }
    const image = this._image = new Image()
    image.onload = () => {
      this._canvas.width = this._image.width
      this._canvas.height = this._image.height
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
    this.state = {
      ...this.state,
      ...{ [key]: value },
    }
  }

  /**
   * 重設圖片
   * @param {StateOptions} state 
   */
  public resetState (state?: StateOptions) {
    this.state = {
      ...CanvasEditor.defaultStateOptions,
      ...state,
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
    this._canvas.toBlob(
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
