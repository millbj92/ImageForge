import { ImageEditorUtilities } from '../Utilities';
import { IGradient } from '../Gradients/IGradient';
import { isUndefined } from 'util';

export class Background {
  constructor(
    public color?: string | number[],
    public opacity?: number,
    public gradient?: IGradient
  ) {}

  getBackgroundColor(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ): string | CanvasGradient {
    if (!isUndefined(this.gradient)) {
      console.log(this.gradient);
      return this.gradient.getGradient(context);
    }
    return ImageEditorUtilities.getColorString(this.color, this.opacity);
  }
}
