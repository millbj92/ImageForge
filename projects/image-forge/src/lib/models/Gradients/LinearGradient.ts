import { IGradient } from './IGradient';
import { ImageEditorUtilities } from '../Utilities';
import { GradientColor } from './GradientColor';

export class LinearGradient implements IGradient {
  constructor(
    public colors: GradientColor[],
    public top: number,
    public left: number,
    public right: number,
    public bottom: number
  ) {}

  getGradient(context: CanvasRenderingContext2D): CanvasGradient {
    console.log(this.left, this.top, this.right, this.bottom);
    let gradient: CanvasGradient = context.createLinearGradient(
      this.left,
      this.top,
      this.right,
      this.bottom
    );
    for (let c of this.colors) {
      gradient.addColorStop(
        c.offset,
        ImageEditorUtilities.getColorString(c.color, c.opacity)
      );
      console.log(ImageEditorUtilities.getColorString(c.color, c.opacity));
    }

    return gradient;
  }
}
