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
  }

  private _canvas!: HTMLCanvasElement
  private _ctx!: CanvasRenderingContext2D
  private _image!: HTMLImageElement
  private _state!: StateOptions

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
   * 將圖片繪製於 canvas 上
   */
  private drawImage () {
    if (!this.hasImage) return
    requestAnimationFrame(() => {
      this._canvas.width = this._image.width
      this._canvas.height = this._image.height
      this._ctx.filter = this.filter
      this._ctx.drawImage(this._image, 0, 0)
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
    image.onload = () => { this.drawImage() }
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
