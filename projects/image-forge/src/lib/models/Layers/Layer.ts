import { Filter } from '../Filter';
import { LayerBlendModes } from './LayerBlendModes';
import { Background } from './Background';
import { isUndefined } from 'util';
import { DomSanitizer } from '@angular/platform-browser';

enum EditState {
  Resize = 'Resize',
  Crop = 'Crop',
  Filter = 'Filter',
  Text = 'Text',
  Draw = 'Draw',
}

enum ResizeState {
  Expand = 'Expand',
  Resize = 'Resize',
}

export class Layer {
  public locked = false;
  public isDefault = false;
  public selected = false;
  public name = 'Untitled';
  public blendModes = LayerBlendModes;
  public blendMode = this.blendModes.SourceOver;
  public background: Background = new Background([255, 255, 255, 255], 1);
  public visible: boolean = true;
  public filter: Filter;
  public opacity: number = 1;
  public positionX: number = 0;
  public positionY: number = 0;
  public positionRight: number = 0;
  public positionBottom: number = 0;
  public handleSize: number = 30;
  public resizerRadius: number = 8;
  public outline = false;
  public pi2 = Math.PI * 2;
  public rr = this.resizerRadius * this.resizerRadius;

  changeOpacity(input) {
    this.opacity = input;
    this.background.opacity = this.opacity;
  }

  changeEditState(state: EditState) {
    if (state === this.editState.Resize) {
      this.currentResizeState = this.resizeState.Expand;
    }

    if (this.currentEditState !== state) this.currentEditState = state;

    if (this.currentEditState == this.editState.Crop) {
      //this.cd.detectChanges();
      this.cropX = this.imageX;
      this.cropY = this.imageY;
      this.cropWidth = this.imageWidth;
      this.cropHeight = this.imageHeight;
      this.cropRight = this.imageRight;
      this.cropBottom = this.imageBottom;
      this._currentCrop = `polygon(0% 0%, 0% 100%, ${this.cropX}px 100%, ${
        this.cropX
      }px ${this.cropY}px, ${this.cropRight}px ${this.cropY}px, ${
        this.cropRight
      }px ${this.cropBottom}px, ${this.cropRight - this.cropWidth}px ${
        this.cropBottom
      }px, ${this.cropRight - this.cropWidth}px 100%, 100% 100%, 100% 0%)`;
      //this.cd.detectChanges();
    }
  }

  //#region Global Variables
  //Canvas Options
  canvasElement;
  canvasContext;
  canvasOffset;

  //Main Overlay Options
  _originalClip = 'none';
  currentClip;

  //Screen Adjustment Options
  dpi;
  sizeDivisor;

  //Pixel Grid
  gridHeightPx = 0;
  gridWidthPx = 0;

  //Text

  //State
  editState = EditState;
  resizeState = ResizeState;
  currentEditState = this.editState.Resize;
  currentResizeState = this.resizeState.Expand;

  //Canvas Image
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  imageWidth;
  imageHeight;
  imageRight;
  imageBottom;

  //Position and resizing
  startX;
  startY;
  resizing;
  imageX: number;
  imageY: number;
  dragging = false;
  overlayStyle;
  lockX = false;
  lockY = false;
  lockScaleX = false;
  lockScaleY = false;
  scaleX = 0;
  scaleY = 0;

  //Crop overlay variables
  cropX;
  cropY;
  cropWidth;
  cropRight;
  cropBottom;
  cropHeight;
  _originalCrop;
  _currentCrop;

  //Image Crop Variables
  imageCropX = 0;
  imageCropY = 0;
  imageCropWidth = 0;
  imageCropHeight;

  //Difference, in pixels, from crop overlay to image rect
  cropDiffTop = 0;
  cropDiffRight = 0;
  cropDiffLeft = 0;
  cropDifBottom = 0;

  //Reset
  lastX = 0;
  lastY = 0;
  originalX = 0;
  originalY = 0;
  originalHeight = 0;
  originalWidth = 0;
  originalRight = 0;
  originalBottom = 0;

  //source image
  img;
  sourceImageHeight = 0;
  sourceImageWidth = 0;
  sourceDifferenceWidth = 0;
  sourceDifferenceHeight = 0;

  aspectRatio: string = '0:0';
  drawAspectGrid = false;

  //Hotkeys
  keyMap = {
    ControlLeft: false,
    AltLeft: false,
    ShiftLeft: false,
    KeyX: false,
    KeyC: false,
    KeyR: false,
    KeyS: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
  };

  loading = true;

  toggleAspectGrid() {
    this.drawAspectGrid = !this.drawAspectGrid;
    //this.layerChanged.emit();
  }

  //Sanitized Properties
  public get originalClip() {
    return this.sanitizer.bypassSecurityTrustStyle(this._originalClip);
  }

  public get originalCrop() {
    return this.sanitizer.bypassSecurityTrustStyle(this._originalCrop);
  }

  public get currentCrop() {
    return this.sanitizer.bypassSecurityTrustStyle(this._currentCrop);
  }
  //#endregion

  constructor(
    name: string,
    width?: number,
    height?: number,
    private sanitizer?: DomSanitizer,
    canvasElement?,
    isdefault?: boolean,
    locked?
  ) {
    this.name = name;
    if (!isUndefined(width)) this.width = width;
    if (!isUndefined(height)) this.height = height;

    if (!isUndefined(this.width) && !isUndefined(this.height)) {
      /*const r = this.gcd(this.width, this.height);
      const linesX = this.width / r;
      const linesY = this.height / r;

      this.aspectRatio = `${linesX}:${linesY}`;*/
    }
    if (!isUndefined(this.canvasElement)) {
      this.canvasElement = canvasElement;
      this.canvasOffset = this.canvasElement.getBoundingClientRect();
      this.offsetX = this.canvasOffset.left;
      this.offsetY = this.canvasOffset.top;
      this.positionRight = this.positionX + this.width;
      this.positionBottom = this.positionY + this.height;
    }
    if (!isUndefined(isdefault)) {
      this.isDefault = true;
    }
    if (!isUndefined(locked)) {
      this.locked = locked;
    }
  }

  toggleVisibility(event: MouseEvent) {
    event.stopPropagation();
    this.visible = !this.visible;
  }

  toggleLocked(event: MouseEvent) {
    event.stopPropagation();
    this.locked = !this.locked;
  }

  toggleOutline(event: MouseEvent) {
    event.stopPropagation();
    this.outline = !this.outline;
  }

  getLayerContext(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    context.fillStyle = this.background.getBackgroundColor(context);
    context.fillRect(this.positionX, this.positionY, this.width, this.height);

    if (!isUndefined(this.filter))
      context.filter = this.filter.getFilterString();

    if (this.outline && !this.isDefault) {
      context.strokeStyle = 'red';
      context.lineWidth = 1;
      context.strokeRect(
        this.positionX,
        this.positionY,
        this.width,
        this.height
      );
    }

    if (!isUndefined(this.img)) {
      context.globalAlpha = this.opacity;
      context.drawImage(
        this.img,
        this.imageCropX,
        this.imageCropY,
        this.imageCropWidth,
        this.imageCropHeight,
        this.positionX,
        this.positionY,
        this.width,
        this.height
      );
      context.globalAlpha = 1;
    }

    if (!isUndefined(this.filter)) {
      context.beginPath();
      context.globalCompositeOperation = this.filter.overlay.blendMode;
      context.fillStyle = this.filter.overlay.background.getBackgroundColor(
        context
      );
      context.fillRect(this.positionX, this.positionY, this.width, this.height);
      context.closePath();
    }

    if (this.drawAspectGrid) {
      let r = this.gcd(this.width, this.height);
      let linesX = this.width / r;
      let linesY = this.height / r;

      if (r > 5) {
        let stepX = this.width / linesX;
        let stepY = this.height / linesY;
        context.strokeStyle = '#C8C8C8';
        for (
          let x = this.positionX;
          x <= this.positionX + this.width;
          x += stepX
        ) {
          context.beginPath();
          context.moveTo(x, this.positionY);
          context.lineTo(x, this.positionY + this.height);
          context.closePath();
          context.stroke();
        }

        for (
          let y = this.positionY;
          y <= this.positionY + this.height;
          y += stepY
        ) {
          context.beginPath();
          context.moveTo(this.positionX, y);
          context.lineTo(this.positionX + this.width, y);
          context.closePath();
          context.stroke();
        }
      }
      context.font = '25px Roboto';
      context.fillText(
        `${linesX}:${linesY}`,
        this.positionX + 15,
        this.positionY + 25
      );
    }

    if (this.selected && !this.locked) {
      if (this.currentEditState === this.editState.Resize) {
        this.drawDragAnchor(context, this.positionX, this.positionY);
        this.drawDragAnchor(context, this.positionRight, this.positionY);
        this.drawDragAnchor(context, this.positionRight, this.positionBottom);
        this.drawDragAnchor(context, this.positionX, this.positionBottom);
      } else if (this.currentEditState === this.editState.Crop) {
        this.drawCropAnchor(this.cropX - 5, this.cropY - 5, true, true);
        this.drawCropAnchor(this.cropRight + 5, this.cropY - 5, true, false);
        this.drawCropAnchor(
          this.cropRight + 5,
          this.cropBottom + 5,
          false,
          false
        );
        this.drawCropAnchor(this.cropX - 5, this.cropBottom + 5, false, true);
      }
    }
  }

  gcd(a, b) {
    return b == 0 ? a : this.gcd(b, a % b);
  }

  drawDragAnchor(context, x, y) {
    context.beginPath();
    context.fillStyle = '#cc5d25';
    context.arc(x, y, this.resizerRadius, 0, this.pi2, false);
    context.closePath();
    context.fill();
  }

  drawCropAnchor(x, y, top, left) {
    const xTo = left == true ? this.handleSize : -this.handleSize;
    const yTo = top == true ? this.handleSize : -this.handleSize;
    this.canvasContext.lineWidth = 5;
    this.canvasContext.strokeStyle = '#cc5d25';
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(x, y);
    this.canvasContext.lineTo(x + xTo, y);
    this.canvasContext.lineTo(x, y);
    this.canvasContext.lineTo(x, y + yTo);
    this.canvasContext.closePath();
    this.canvasContext.stroke();
  }
}
