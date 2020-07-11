import { CSSUnits } from './CSSUnits';
import { ImageEditorUtilities } from './Utilities';

export class FilterDropShadow {
  units = CSSUnits;
  offsetX: number = 0;
  offsetXUnit: CSSUnits = this.units.px;
  offsetY: number = 0;
  offsetYUnit: CSSUnits = this.units.px;
  blurRadius: number = 0;
  blurRadiusUnit: CSSUnits = this.units.px;
  spreadRadius: number = 0;
  spreadRadiusUnit: CSSUnits = this.units.px;
  color: string | number[] = '#000';
  opacity: number = 1;
  constructor() {}

  public getDropShadowString() {
    return `drop-shadow(${this.offsetX}${this.offsetXUnit} ${this.offsetY}${
      this.offsetYUnit
    } ${this.blurRadius}${this.blurRadiusUnit} ${this.spreadRadius}${
      this.spreadRadiusUnit
    } ${ImageEditorUtilities.getColorString(this.color, this.opacity)})`;
  }
}
