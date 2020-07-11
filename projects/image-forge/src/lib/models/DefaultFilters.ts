import { Filter } from './Filter';
import { Layer } from './Layers/Layer';
import { LayerBlendModes } from './Layers/LayerBlendModes';
import { LinearGradient } from './Gradients/LinearGradient';
import { GradientColor } from './Gradients/GradientColor';
import { RadialGradient } from './Gradients/RadialGradient';

export class DefaultFilters {
  defaultFilters: Array<Filter>;
  public None: Filter = new Filter('None');
  public Oldies: Filter = new Filter('Oldies');
  public Aden: Filter = new Filter('Aden');
  public Amaro: Filter = new Filter('Amaro');
  public Brannan: Filter = new Filter('Brannan');
  public Brooklyn: Filter = new Filter('Brooklyn');
  public Clarendon: Filter = new Filter('Clarendon');
  public Earlybird: Filter = new Filter('Earlybird');
  public Gingham: Filter = new Filter('Gingham');
  public Hudson: Filter = new Filter('Hudson');
  public Inkwell: Filter = new Filter('Inkwell');
  public Lofi: Filter = new Filter('Lofi');
  public Maven: Filter = new Filter('Maven');
  public Perpetua: Filter = new Filter('Perpetua');
  public Reyes: Filter = new Filter('Reyes');
  public Stinson: Filter = new Filter('Stinson');
  public Toaster: Filter = new Filter('Toaster');
  constructor(layer: Layer) {
    //Oldies
    this.Oldies.contrast = 110;
    this.Oldies.brightness = 110;
    this.Oldies.saturate = 130;
    this.Oldies.overlay.blendMode = LayerBlendModes.Screen;
    this.Oldies.overlay.background.color = [243, 106, 188, 0.3];

    //Aden
    this.Aden.contrast = 90;
    this.Aden.brightness = 120;
    this.Aden.saturate = 85;
    this.Aden.hueRotate = 20;
    this.Aden.overlay.blendMode = LayerBlendModes.Darken;
    this.Aden.overlay.background.gradient = new LinearGradient(
      [
        new GradientColor(0, [66, 10, 14, 0.2], 1),
        new GradientColor(1, [66, 10, 14, 0], 1),
      ],
      0,
      layer.height,
      layer.width,
      layer.height
    );

    this.Amaro.contrast = 90;
    this.Amaro.brightness = 110;
    this.Amaro.saturate = 150;
    this.Amaro.hueRotate = -10;

    this.Brannan.contrast = 140;
    this.Brannan.sepia = 50;
    this.Brannan.overlay.blendMode = LayerBlendModes.Lighten;
    this.Brannan.overlay.background.color = [161, 44, 199, 0.31];

    this.Brooklyn.contrast = 90;
    this.Brooklyn.brightness = 110;
    this.Brooklyn.overlay.blendMode = LayerBlendModes.Overlay;
    this.Brooklyn.overlay.background.gradient = new RadialGradient(
      [
        new GradientColor(0.1, [208, 186, 142, 0.4]),
        new GradientColor(1, [29, 2, 16, 0.2]),
      ],
      layer.height / 2,
      layer.width / 2,
      layer.width / 2,
      layer.width / 2 + 10,
      layer.height / 2 + 10,
      layer.width * layer.height
    );

    this.Clarendon.contrast = 120;
    this.Clarendon.saturate = 125;
    this.Clarendon.overlay.blendMode = LayerBlendModes.Overlay;
    this.Clarendon.overlay.background.color = [127, 187, 227, 0.2];

    this.Earlybird.contrast = 90;
    this.Earlybird.sepia = 20;
    this.Earlybird.overlay.blendMode = LayerBlendModes.Overlay;
    this.Earlybird.overlay.background.gradient = new RadialGradient(
      [
        new GradientColor(0, [29, 2, 16, 0.2]),
        new GradientColor(0.2, [208, 186, 142, 1]),
      ],
      layer.imageY + layer.imageHeight / 2,
      layer.imageX + layer.imageWidth / 2,
      4 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        ),
      layer.imageRight - layer.imageWidth / 2,
      layer.imageBottom - layer.imageHeight / 2,
      0.5 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        )
    );

    this.Gingham.brightness = 105;
    this.Gingham.hueRotate = 350;
    this.Gingham.overlay.blendMode = LayerBlendModes.Darken;
    this.Gingham.overlay.background.gradient = new LinearGradient(
      [
        new GradientColor(0, [66, 10, 14, 0.2], 1),
        new GradientColor(1, [0, 0, 0, 0], 1),
      ],
      0,
      layer.height,
      layer.width,
      layer.height
    );

    this.Hudson.contrast = 90;
    this.Hudson.brightness = 120;
    this.Hudson.saturate = 110;
    this.Hudson.overlay.blendMode = LayerBlendModes.Multiply;
    this.Hudson.overlay.opacity;
    this.Hudson.overlay.background.gradient = new RadialGradient(
      [
        new GradientColor(1, [255, 177, 166, 1]),
        new GradientColor(0.5, [52, 33, 52, 1]),
      ],
      layer.imageY + layer.imageHeight / 2,
      layer.imageX + layer.imageWidth / 2,
      4 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        ),
      layer.imageRight - layer.imageWidth / 2,
      layer.imageBottom - layer.imageHeight / 2,
      0.5 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        )
    );

    this.Inkwell.contrast = 110;
    this.Inkwell.brightness = 110;
    this.Inkwell.sepia = 30;
    this.Inkwell.grayscale = 100;

    this.Lofi.contrast = 150;
    this.Lofi.saturate = 110;
    this.Lofi.overlay.blendMode = LayerBlendModes.Multiply;
    this.Lofi.overlay.background.gradient = new RadialGradient(
      [
        new GradientColor(1, [0, 0, 0, 0], 0),
        new GradientColor(0.7, [34, 34, 34, 1]),
      ],
      layer.imageY + layer.imageHeight / 2,
      layer.imageX + layer.imageWidth / 2,
      4 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        ),
      layer.imageRight - layer.imageWidth / 2,
      layer.imageBottom - layer.imageHeight / 2,
      0.5 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        )
    );

    this.Maven.contrast = 95;
    this.Maven.brightness = 95;
    this.Maven.saturate = 150;
    this.Maven.sepia = 25;
    this.Maven.overlay.blendMode = LayerBlendModes.Hue;
    this.Maven.overlay.background.color = [3, 230, 26, 0.2];

    this.Perpetua.overlay.blendMode = LayerBlendModes.SoftLight;
    this.Perpetua.overlay.background.gradient = new LinearGradient(
      [
        new GradientColor(0.1, [0, 91, 154, 1], 1),
        new GradientColor(1, [61, 193, 230, 0], 0),
      ],
      0,
      layer.height,
      layer.width,
      layer.height
    );

    this.Reyes.contrast = 85;
    this.Reyes.brightness = 110;
    this.Reyes.saturate = 75;
    this.Reyes.sepia = 22;
    this.Reyes.overlay.blendMode = LayerBlendModes.SoftLight;
    this.Reyes.overlay.opacity;
    this.Reyes.overlay.background.color = [173, 205, 239, 1];

    this.Stinson.contrast = 75;
    this.Stinson.brightness = 115;
    this.Stinson.saturate = 85;
    this.Stinson.overlay.blendMode = LayerBlendModes.SoftLight;
    this.Stinson.overlay.background.color = [240, 149, 128, 0.2];

    this.Toaster.contrast = 150;
    this.Toaster.brightness = 90;
    this.Toaster.overlay.opacity;
    this.Toaster.overlay.blendMode = LayerBlendModes.Screen;
    this.Toaster.overlay.background.gradient = new RadialGradient(
      [
        new GradientColor(0.1, [15, 78, 128, 1]),
        new GradientColor(1, [59, 0, 59, 1], 1),
      ],
      layer.imageY + layer.imageHeight / 2,
      layer.imageX + layer.imageWidth / 2,
      4 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        ),
      layer.imageRight - layer.imageWidth / 2,
      layer.imageBottom - layer.imageHeight / 2,
      0.5 *
        Math.sqrt(
          ((layer.imageWidth / 2) * layer.imageWidth) / 2 +
            ((layer.imageHeight / 2) * layer.imageHeight) / 2
        )
    );

    this.defaultFilters = [
      this.None,
      this.Oldies,
      this.Aden,
      this.Amaro,
      this.Brannan,
      this.Brooklyn,
      this.Clarendon,
      this.Earlybird,
      this.Gingham,
      this.Hudson,
      this.Inkwell,
      this.Lofi,
      this.Maven,
      this.Perpetua,
      this.Reyes,
      this.Stinson,
      this.Toaster,
    ];
  }
}
