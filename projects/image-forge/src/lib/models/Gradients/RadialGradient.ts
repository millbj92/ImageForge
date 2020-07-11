import { IGradient } from './IGradient';
import { ImageEditorUtilities } from '../Utilities';
import { GradientColor } from './GradientColor';

export class RadialGradient implements IGradient {
  constructor(
    public colors: GradientColor[],
    public top: number,
    public left: number,
    public startRadius: number,
    public right: number,
    public bottom: number,
    public endRadius: number
  ) {}

  getGradient(context: CanvasRenderingContext2D): CanvasGradient {
    console.log(
      this.left,
      this.top,
      this.startRadius,
      this.right,
      this.bottom,
      this.endRadius
    );
    let gradient: CanvasGradient = context.createRadialGradient(
      this.left,
      this.top,
      this.startRadius,
      this.right,
      this.bottom,
      this.endRadius
    );

    for (let c of this.colors) {
      gradient.addColorStop(
        c.offset,
        ImageEditorUtilities.getColorString(c.color, c.opacity)
      );
    }
    return gradient;
  }
}
