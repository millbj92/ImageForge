export class ImageEditorUtilities {
  static isValidColor(colorString: string) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(colorString);
  }

  static hexToRgbA(hex, opacity) {
    let o = opacity;
    let c;

    if (opacity > 1) o = 1;
    if (opacity < 0) o = 0;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return (
        'rgba(' +
        [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') +
        ',' +
        o +
        ')'
      );
    }
    throw new Error('Bad Hex');
  }

  static getColorString(color: string | number[], opacity: number) {
    let colorString = '';
    if (typeof color === 'string') {
      if (this.isValidColor(color)) {
        colorString = ImageEditorUtilities.hexToRgbA(color, opacity);
      } else {
        console.error(
          'Color must be a valid HEX, otherwise supply an array for rgba'
        );
      }
    } else {
      colorString = `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
    }
    return colorString;
  }

  //Fix image dots per inch with respect to screen ration
  static fixDpi(canvasElement, scaleX: number, scaleY: number) {
    const dpi = window.devicePixelRatio || 1;
    const sizeDivisor = dpi * 2;
    const style_height = +getComputedStyle(canvasElement)
      .getPropertyValue('height')
      .slice(0, -2);
    const style_width = +getComputedStyle(canvasElement)
      .getPropertyValue('width')
      .slice(0, -2);
    canvasElement.setAttribute('height', style_height * dpi);
    canvasElement.setAttribute('width', style_width * dpi);
    const canvasContext = canvasElement.getContext('2d');

    const height =
      (+getComputedStyle(canvasElement)
        .getPropertyValue('height')
        .slice(0, -2) *
        dpi +
        scaleY) /
      sizeDivisor;
    const width =
      (+getComputedStyle(canvasElement).getPropertyValue('width').slice(0, -2) *
        dpi +
        scaleX) /
      sizeDivisor;
    canvasContext.scale(dpi + scaleX, dpi + scaleY);

    return new DPIObject(dpi, sizeDivisor, width, height, canvasContext);
  }
}

export class DPIObject {
  dpi: number = 0;
  sizeDivisor: number = 0;
  width: number = 0;
  height: number = 0;
  canvasContext: any;

  constructor(
    DPI: number,
    SizeDivisor: number,
    Width: number,
    Height: number,
    CanvasContext: any
  ) {
    this.dpi = DPI;
    this.sizeDivisor = SizeDivisor;
    this.width = Width;
    this.height = Height;
    this.canvasContext = CanvasContext;
  }
}
