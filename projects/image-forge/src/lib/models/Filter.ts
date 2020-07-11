import { FilterDropShadow } from './FilterDropShadow';
import { CSSUnits } from './CSSUnits';
import { Layer } from './Layers/Layer';
export class Filter {
  units = CSSUnits;
  name: string = 'None';
  blur: number = 0;
  blurUnit: CSSUnits = this.units.px;
  brightness: number = 0;
  contrast: number = 0;
  dropShadow: FilterDropShadow = null;
  grayscale: number = 0;
  hueRotate: number = 0;
  invert: number = 0;
  opacity: number = 100;
  saturate: number = 0;
  sepia: number = 0;
  url: string = null;
  overlay: Layer = new Layer('overlay');

  constructor(Name: string) {
    this.name = Name;
  }

  getFilterString() {
    return `${this.blur > 0 ? 'blur(' + this.blur + this.blurUnit + ')' : ''}${
      this.brightness > 0 ? 'brightness(' + this.brightness + '%) ' : ''
    }${this.contrast > 0 ? 'contrast(' + this.contrast + '%) ' : ''}${
      this.grayscale > 0 ? 'grayscale(' + this.grayscale + '%) ' : ''
    }${this.hueRotate > 0 ? 'hue-rotate(' + this.hueRotate + 'deg) ' : ''}${
      this.invert > 0 ? 'invert(' + this.invert + '%) ' : ''
    }${this.opacity < 100 ? 'opacity(' + this.opacity + '%) ' : ''}${
      this.saturate > 0 ? 'saturate(' + this.saturate + '%) ' : ''
    }${this.sepia > 0 ? 'sepia(' + this.sepia + '%) ' : ''}${
      this.dropShadow != null ? this.dropShadow.getDropShadowString() : ''
    }`;
  }
}
