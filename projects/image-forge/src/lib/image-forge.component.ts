import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  isDevMode,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { filters } from './filters';
import { isUndefined } from 'util';
import { Layer } from './models/Layers/Layer';
import { ImageEditorUtilities, DPIObject } from './models/Utilities';
import { Filter } from './models/Filter';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CanvasService } from './shared/canvas.service';
import { LayerService } from './shared/layer.service';
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

@Component({
  selector: 'forge',
  templateUrl: './image-forge-component.html',
  styleUrls: ['./styles/image-forge-component.scss'],
  host: {
    '(document:keydown)': 'handleKeyPress($event)',
    '(document:keyup)': 'handleKeyUp($event)',
    '(document:mousewheel)': 'onMouseWheel($event)',
  },
})
export class ImageForgeComponent implements OnInit, AfterViewInit {
  //#region Inputs
  @Input() source;
  //Canvas Options
  @Input() canvasHeight: 80;
  @Input() canvasWidth: 80;
  //Pixel Grid
  @Input() pixelGrid = false;
  //Overlay Options
  @Input() doOverlay = false;
  @Input() overlayOptions = {
    cropSize: 20,
    shape: {
      type: 'circle',
      sizeX: 80,
      sizeY: 50,
      position: 'center',
    },
    colorHex: '#d3d3d3',
    rgb: undefined,
    opacity: 0.5,
  };
  //Frame Options
  @Input() doFrame = true;
  @Input() frameOptions = {
    borderSize: 1,
    borderShape: 'circle',
    borderStyle: 'solid',
    colorHex: '#cc5d25',
    rgb: undefined,
    opacity: 0.5,
  };
  @Input() frameCircle = true;
  //Resize Options
  @Input() resizerRadius = 8;
  @Input() minSize = 128;
  //Crop Options
  @Input() handleSize = 30;
  @Input() debugMode = false;
  //#endregion

  //#region Element References
  @ViewChild('imgContainer') container: ElementRef;
  @ViewChild('imgBoundry') boundry: ElementRef;
  @ViewChild('cropOverlay', { static: false }) cropOverlay: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('handles') handleContainer: ElementRef;
  @ViewChild('gridOverlay') gridOverlay: ElementRef;
  //#endregion

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

  //Layers
  showLayersPanel = false;
  layers: Layer[];
  selectedLayer: Layer;

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
  draggingResizer;
  imageX: number;
  imageY: number;
  draggingImage = false;
  overlayStyle;
  lockX = false;
  lockY = false;
  lockScaleX = false;
  lockScaleY = false;
  scaleX = 0;
  scaleY = 0;
  mouseX = 0;
  mouseY = 0;

  //Handles
  pi2 = Math.PI * 2;
  rr = this.resizerRadius * this.resizerRadius;

  //Filters
  mFilters = filters;
  selectedFilter: number = 0;
  selectedClass: string;
  Filters: Filter[];
  showFilterPanel = false;

  //Frame
  frameStyle;

  //Crop overlay variables
  cropX;
  cropY;
  cropWidth;
  cropRight;
  cropBottom;
  cropHeight;
  cr = this.handleSize * this.resizerRadius;
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
  img = new Image();
  sourceImageHeight = 0;
  sourceImageWidth = 0;
  sourceDifferenceWidth = 0;
  sourceDifferenceHeight = 0;

  showLayerProperties = true;

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
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private canvasService: CanvasService,
    public layerService: LayerService
  ) {
    if (!isDevMode()) {
      this.debugMode = false;
    }
    this.mFilters = filters;
    this.layers = Array<Layer>();
  }

  selectLayer(layer: Layer) {
    this.selectedLayer.selected = false;
    this.selectedLayer = layer;
    this.selectedLayer.selected = true;
    this.drawCanvas();
  }

  createLayer() {
    let newLayer = new Layer(
      `Layer ${this.layers.length.toString()}`,
      this.canvasElement.getBoundingClientRect().width,
      this.canvasElement.getBoundingClientRect().height,
      this.sanitizer,
      this.canvasElement
    );
    this.layerService.addLayer(newLayer);
  }

  deleteLayer(layer: Layer) {
    if (layer.locked) return;

    this.layers = this.layers.filter((x) => x !== layer);
    this.drawCanvas();
  }

  layerDropped(event: CdkDragDrop<Layer[]>) {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
    this.drawCanvas();
  }

  onFileDropped($event) {
    let image = $event.files[0];
    if (image.type.match('image.*')) {
      var x = $event.x - this.offsetX;
      var y = $event.y - this.offsetY;
      this.layerService.addImage(image, x, y);
    }
  }

  /* onFileDropped($event) {
    let image = $event.files[0];
    if (image.type.match('image.*')) {
      let img = new Image();
      const objectUrl = URL.createObjectURL(image);
      img.onload = () => {
        let imgLayer = new ImageLayer(
          `Image ${this.layers.length.toString()}`,
          img
        );
        imgLayer.img = img;
        imgLayer.positionX = $event.x - this.offsetX - imgLayer.width / 2;
        imgLayer.positionY = $event.y - this.offsetY - imgLayer.height / 2;
        imgLayer.imageX = imgLayer.positionX;
        imgLayer.imageY = imgLayer.positionY;
        imgLayer.loadImage();
        //this.layers.push(imgLayer);
        this.layerService.addLayer(imgLayer);
        URL.revokeObjectURL(objectUrl);
        this.selectLayer(imgLayer);
        this.drawCanvas();
      };
      img.src = objectUrl;
    }
  }*/

  fileBrowseHandler(files) {
    this.onFileDropped(files);
  }

  //#region Draw Canvas
  drawCanvas() {
    //Clear for redrawing
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    for (let x = 0; x < this.canvasElement.width; x += 10) {
      for (let y = 0; y < this.canvasElement.height; y += 5) {
        this.canvasContext.fillStyle = '#C8C8C8';
        this.canvasContext.fillRect(y % 2 == 0 ? x + 5 : x, y, 5, 5);
      }
    }

    for (let lay of this.layers) {
      if (lay.visible) lay.getLayerContext(this.canvasContext);
    }
    this.canvasElement.globalAlpha = 1;
    return;
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.canvasContext.filter = 'none';
    this.canvasContext.globalCompositeOperation = 'source-over';
    this.canvasContext.globalAlpha = 1;
    this.canvasContext.fillStyle = 'white';

    if (this.Filters[this.selectedFilter].name === 'None') {
      this.canvasContext.fillStyle = 'white';
      this.canvasContext.fillRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      this.canvasContext.drawImage(
        this.img,
        this.imageCropX,
        this.imageCropY,
        this.imageCropWidth,
        this.imageCropHeight,
        this.imageX,
        this.imageY,
        this.imageWidth,
        this.imageHeight
      );

      if (this.currentEditState === this.editState.Resize) {
        this.drawDragAnchor(this.imageX, this.imageY);
        this.drawDragAnchor(this.imageRight, this.imageY);
        this.drawDragAnchor(this.imageRight, this.imageBottom);
        this.drawDragAnchor(this.imageX, this.imageBottom);
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
      return;
    }

    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.canvasContext.filter = this.Filters[
      this.selectedFilter
    ].getFilterString();
    this.canvasContext.drawImage(
      this.img,
      this.imageCropX,
      this.imageCropY,
      this.imageCropWidth,
      this.imageCropHeight,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight
    );

    if (isUndefined(this.Filters[this.selectedFilter].overlay) === false) {
      this.canvasContext.beginPath();
      this.canvasContext.globalAlpha = this.Filters[
        this.selectedFilter
      ].overlay.opacity;
      this.canvasContext.globalCompositeOperation = this.Filters[
        this.selectedFilter
      ].overlay.blendMode;
      this.canvasContext.fillStyle = this.Filters[
        this.selectedFilter
      ].overlay.background.getBackgroundColor(this.canvasContext);
      this.canvasContext.fillRect(
        this.imageX,
        this.imageY,
        this.imageWidth,
        this.imageHeight
      );
      this.canvasContext.closePath();
    }

    if (this.currentEditState === this.editState.Resize) {
      this.drawDragAnchor(this.imageX, this.imageY);
      this.drawDragAnchor(this.imageRight, this.imageY);
      this.drawDragAnchor(this.imageRight, this.imageBottom);
      this.drawDragAnchor(this.imageX, this.imageBottom);
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

  drawDragAnchor(x, y) {
    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = '#cc5d25';
    this.canvasContext.arc(x, y, this.resizerRadius, 0, this.pi2, false);
    this.canvasContext.closePath();
    this.canvasContext.fill();
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

  //#endregion

  //#region On Init
  ngOnInit(): void {
    this.layerService.layerEdited.subscribe(() => {
      this.drawCanvas();
    });

    let overlayBG = '';
    const overlayColor = isUndefined(this.overlayOptions.rgb)
      ? ImageEditorUtilities.hexToRgbA(
          this.overlayOptions.colorHex,
          this.overlayOptions.opacity
        )
      : `rgba(${this.overlayOptions.rgb[0]},${this.overlayOptions.rgb[1]},${this.overlayOptions.rgb[2]},${this.overlayOptions.opacity})`;
    switch (this.overlayOptions.shape.type) {
      case 'circle': {
        overlayBG = `radial-gradient(circle at ${
          this.overlayOptions.shape.position
        }, transparent ${this.overlayOptions.cropSize}rem, ${overlayColor} ${
          this.overlayOptions.cropSize + 0.1
        }rem)`;
        break;
      }
      case 'ellipse': {
        overlayBG = `radial-gradient(${this.overlayOptions.shape.sizeX}rem ${
          this.overlayOptions.shape.sizeY
        }rem ellipse at ${this.overlayOptions.shape.position}, transparent ${
          this.overlayOptions.cropSize
        }rem, ${overlayColor} ${this.overlayOptions.cropSize + 0.1}rem)`;
      }
      case 'square': {
        this._originalClip = `polygon(0% 0%, 0% 100%, ${
          this.overlayOptions.cropSize
        }rem 100%, ${this.overlayOptions.cropSize}rem ${
          this.overlayOptions.cropSize
        }rem, ${this.canvasWidth - this.overlayOptions.cropSize}rem ${
          this.overlayOptions.cropSize
        }rem, ${this.canvasWidth - this.overlayOptions.cropSize}rem ${
          this.canvasHeight - this.overlayOptions.cropSize
        }rem, ${this.overlayOptions.cropSize}rem ${
          this.canvasHeight - this.overlayOptions.cropSize
        }rem, ${this.overlayOptions.cropSize}rem 100%, 100% 100%, 100% 0%)`;
        overlayBG = overlayColor;
      }
    }

    const frameColor = isUndefined(this.frameOptions.rgb)
      ? ImageEditorUtilities.hexToRgbA(
          this.frameOptions.colorHex,
          this.frameOptions.opacity
        )
      : `rgba(${this.frameOptions.rgb[0]},${this.frameOptions.rgb[1]},${this.frameOptions.rgb[2]},${this.frameOptions.opacity})`;
    this.frameStyle = {
      border: `${this.frameOptions.borderSize}px ${this.frameOptions.borderStyle} ${frameColor}`,
      'border-radius': this.frameOptions.borderShape == 'circle' ? '50%' : '0',
    };

    this.overlayStyle = {
      background: overlayBG,
    };
  }
  //#endregion

  //#region After View Initialization
  ngAfterViewInit(): void {
    this.canvasService.canvasContextChanged.subscribe(
      (context: CanvasRenderingContext2D) => {
        this.canvasContext = context;
      }
    );

    this.layerService.layersChanged.subscribe((layers) => {
      this.layers = layers;
      if (!isUndefined(this.canvasContext)) this.drawCanvas();
    });

    this.layerService.selectedLayerChanged.subscribe((layer: Layer) => {
      this.selectedLayer = layer;
      this.drawCanvas();
    });

    this.canvasElement = this.canvas.nativeElement;
    this.canvasOffset = this.canvasElement.getBoundingClientRect();
    this.offsetX = this.canvasOffset.left;
    this.offsetY = this.canvasOffset.top;
    this.canvasService.canvasChanged.next(this.canvasElement);

    this.cd.detectChanges();
    /*const dpiObject: DPIObject = ImageEditorUtilities.fixDpi(
      this.canvasElement,
      this.scaleX,
      this.scaleY
    );
    this.dpi = dpiObject.dpi;
    this.sizeDivisor = dpiObject.sizeDivisor;
    this.width = dpiObject.width;
    this.height = dpiObject.height;
    this.canvasContext = dpiObject.canvasContext;
    this.width = this.canvasElement.width;
    this.height = this.canvasElement.height;

    let defaultLayer = new Layer(
      'Background',
      this.canvasElement.getBoundingClientRect().width,
      this.canvasElement.getBoundingClientRect().height,
      this.canvasContext,
      this.canvasElement
    );
    defaultLayer.isDefault = true;
    defaultLayer.locked = true;
    defaultLayer.layerChanged.subscribe(() => {
      this.drawCanvas();
    });
    this.layers.push(defaultLayer);
    this.selectedLayer = this.layers[0];

    this.img.onload = () => {
      this.canvasOffset = this.canvasElement.getBoundingClientRect();
      this.offsetX = this.canvasOffset.left;
      this.offsetY = this.canvasOffset.top;
      this.canvasContext = this.canvasElement.getContext('2d');
      this.gridHeightPx = this.canvasElement.getBoundingClientRect().height;
      this.gridWidthPx = this.canvasElement.getBoundingClientRect().width;

      this.sourceImageHeight = this.img.height;
      this.sourceImageWidth = this.img.width;

      //this.img.width = this.width;
      //this.img.height = this.height;
      this.imageWidth = this.img.width;
      this.imageHeight = this.img.height;
      this.sourceDifferenceWidth = this.imageWidth - this.sourceImageWidth;
      this.sourceDifferenceHeight = this.imageHeight - this.sourceImageHeight;
      this.imageX =
        this.canvasElement.width / this.dpi / 2 - this.imageWidth / 2;
      this.imageY =
        this.canvasElement.height / this.dpi / 2 - this.imageHeight / 2;
      this.imageRight = this.imageX + this.imageWidth;
      this.imageBottom = this.imageY + this.imageHeight;
      this.lastX = this.imageX;
      this.lastY = this.imageY;
      this.originalX = this.imageX;
      this.originalY = this.imageY;
      this.originalWidth = this.imageWidth;
      this.originalHeight = this.imageHeight;
      this.originalRight = this.imageRight;
      this.originalBottom = this.imageBottom;
      this.cropX = this.imageX;
      this.cropY = this.imageY;
      this.cropWidth = this.imageWidth;
      this.cropHeight = this.imageHeight;
      this.cropRight = this.imageRight;
      this.cropBottom = this.imageBottom;
      this.imageCropX = 0;
      this.imageCropY = 0;
      this.imageCropHeight = this.sourceImageHeight;
      this.imageCropWidth = this.sourceImageWidth;

      this.Filters = new DefaultFilters(
        this.canvasContext,
        this.selectedLayer
      ).defaultFilters;
      //this._originalCrop = `polygon(0% 0%, 0% 100%, ${this.overlayOptions.cropSize}rem 100%, ${this.overlayOptions.cropSize}rem ${this.overlayOptions.cropSize}rem, ${this.canvasWidth - this.overlayOptions.cropSize}rem ${this.overlayOptions.cropSize}rem, ${ this.canvasWidth - this.overlayOptions.cropSize}rem ${this.canvasHeight - this.overlayOptions.cropSize}rem, ${this.overlayOptions.cropSize}rem ${this.canvasHeight - this.overlayOptions.cropSize}rem, ${this.overlayOptions.cropSize}rem 100%, 100% 100%, 100% 0%)`
      this._originalCrop = `polygon(0% 0%, 0% 100%, ${this.cropX}px 100%, ${
        this.cropX
      }px ${this.cropY}px, ${this.cropRight}px ${this.cropY}px, ${
        this.cropRight
      }px ${this.cropBottom}px, ${this.cropRight - this.cropWidth}px ${
        this.cropBottom
      }px, ${this.cropRight - this.cropWidth}px 100%, 100% 100%, 100% 0%)`;
      this._currentCrop = this._originalCrop;
      //if (this.pixelGrid === true) {
      //  this.drawPixelGrid();
      // }
      this.loading = false;
    };
    this.cd.detectChanges();
    this.drawCanvas();*/
  }
  //#endregion

  //#region State
  changeEditState(state: EditState) {
    this.selectedLayer.changeEditState(state);

    if (state === this.editState.Resize) {
      //this.doOverlay = true;
      //this.doFrame = true;
      this.currentResizeState = this.resizeState.Expand;
    }

    if (this.currentEditState !== state) this.currentEditState = state;

    if (this.currentEditState == this.editState.Crop) {
      //this.cd.detectChanges();
      this.doOverlay = false;
      this.doFrame = false;
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

    this.drawCanvas();
  }
  //#endregion

  //#region Layers
  toggleLayersPanel() {
    this.showLayersPanel = !this.showLayersPanel;
  }
  //#endregion

  //#region Filters
  selectClass(index) {
    this.selectedFilter = index;
    console.log(this.Filters[index].name);
    this.drawCanvas();
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }
  //#endregion

  //#region  Cropping

  doCrop(e) {
    if (this.draggingResizer > -1) {
      let mouseX = e.clientX - this.offsetX;
      let mouseY = e.clientY - this.offsetY;

      var dx = mouseX - this.startX;
      var dy = mouseY - this.startY;

      this.cropDiffLeft = Math.abs(this.imageX - this.cropX);
      if (this.cropDiffLeft > this.originalWidth - this.minSize) {
        this.cropDiffLeft = this.originalWidth - this.minSize;
      }
      if (this.cropDiffLeft < 0) this.cropDiffLeft = 0;

      this.cropDiffTop = Math.abs(this.originalY - this.cropY);
      if (this.cropDiffTop > this.originalHeight - this.minSize) {
        this.cropDiffTop = this.originalHeight - this.minSize;
      }
      if (this.cropDiffTop < 0) this.cropDiffTop = 0;

      this.cropDiffRight = this.originalRight - this.cropRight;
      if (this.cropDiffRight > this.originalWidth - this.minSize) {
        this.cropDiffRight = this.originalWidth - this.minSize;
      }

      this.cropDifBottom = this.originalBottom - this.cropBottom;
      if (this.cropDifBottom > this.originalHeight - this.minSize) {
        this.cropDifBottom = this.originalHeight - this.minSize;
      }
      if (this.cropDifBottom < 0) this.cropDiffTop = 0;

      console.log(
        'Top: ' + this.cropDiffTop,
        'Left: ' + this.cropDiffLeft,
        'Right: ' + this.cropDiffRight,
        'Bottom: ' + this.cropDifBottom
      );

      switch (this.draggingResizer) {
        case 0: //top-left
          //if crop is not below min size, do crop.
          if (this.cropRight - mouseX >= this.minSize && dx > 0) {
            this.cropX = mouseX;
            this.cropWidth = this.cropRight - mouseX;
            this.startX = mouseX;
          } else if (this.cropRight - mouseX <= this.minSize && dx > 0) {
            this.cropX = this.imageRight - this.minSize;
            this.cropWidth = this.cropRight - this.cropX;
          } else if (dx < 0) {
            this.cropX = mouseX;
            this.cropWidth = this.cropRight - mouseX;
            if (this.cropWidth > this.imageWidth) {
              this.cropWidth = this.imageWidth;
            }
          }

          //Top
          if (this.cropBottom - mouseY >= this.minSize && dy > 0) {
            this.cropY = mouseY;
            this.cropHeight = this.cropBottom - mouseY;
            this.startY = mouseY;
          } else if (this.cropBottom - mouseY <= this.minSize && dy > 0) {
            this.cropY = this.imageBottom - this.minSize;
            this.cropHeight = this.cropBottom - this.cropY;
          } else if (dy < 0) {
            this.cropY = mouseY;
            this.cropHeight = this.cropBottom - mouseY;
          }
          if (this.cropX <= this.imageX) {
            this.cropX = this.imageX;
          }
          if (this.cropY <= this.imageY) {
            this.cropY = this.imageY;
            this.cropHeight = this.cropBottom - this.cropY;
          }
          break;
        case 1: //top-right
          if (this.cropRight - this.imageX >= this.minSize && dx < 0) {
            this.cropRight = mouseX; //- this.cropX;
            this.cropWidth = this.cropRight + mouseX;
            this.startX = mouseX;
          } else if (this.cropRight - this.imageX <= this.minSize && dx > 0) {
            this.cropRight = mouseX;
            this.cropWidth = this.cropRight + mouseX;
          } else if (dx > 0) {
            this.cropRight = mouseX; //- this.cropX;
            this.cropWidth = this.cropRight + mouseX;
          }

          if (this.cropHeight >= this.minSize && dy > 0) {
            this.cropY = mouseY;
            this.cropHeight = this.cropBottom - mouseY;
            this.startY = mouseY;
          } else if (dy < 0) {
            this.cropY = mouseY;
            this.cropHeight = this.cropBottom - mouseY;
          }

          if (this.cropRight >= this.imageRight) {
            this.cropRight = this.imageRight;
          }
          if (this.cropY <= this.imageY) {
            this.cropY = this.imageY;
          }
          break;
        case 2: //bottom-right
          if (this.cropRight - this.imageX >= this.minSize && dx < 0) {
            this.cropRight = mouseX; //- this.cropX;
            this.cropWidth = this.cropRight + mouseX;
            this.startX = mouseX;
          } else if (dx > 0) {
            this.cropRight = mouseX; //- this.cropX;
            this.cropWidth = this.cropRight + mouseX;
          }
          if (this.cropBottom - this.imageY >= this.minSize && dy < 0) {
            this.cropBottom = mouseY;
            this.startY = mouseY;
          } else if (dy > 0) {
            this.cropBottom = mouseY;
          }

          if (this.cropRight >= this.imageRight) {
            this.cropRight = this.imageRight;
          }
          if (this.cropBottom >= this.imageBottom) {
            this.cropBottom = this.imageBottom;
          }
          break;
        case 3: //bottom-left
          if (this.cropWidth >= this.minSize && dx > 0) {
            this.cropX = mouseX;
            this.cropWidth = this.cropRight - mouseX;
            this.startX = mouseX;
          } else if (dx < 0) {
            this.cropX = mouseX;
            this.cropWidth = this.cropRight - mouseX;
          }
          if (this.cropBottom - this.imageY >= this.minSize && dy < 0) {
            this.cropBottom = mouseY;
            this.startY = mouseY;
          } else if (dy > 0) {
            this.cropBottom = mouseY;
          }

          if (this.cropX <= this.imageX) {
            this.cropX = this.imageX;
          }
          if (this.cropBottom >= this.imageBottom) {
            this.cropBottom = this.imageBottom;
          }
          break;
      }

      this.cropWidth = this.cropRight - this.cropX;
      this.cropHeight = this.cropBottom - this.cropY;

      this._currentCrop = `polygon(0% 0%, 0% 100%, ${this.cropX}px 100%, ${
        this.cropX
      }px ${this.cropY}px, ${this.cropRight}px ${this.cropY}px, ${
        this.cropRight
      }px ${this.cropBottom}px, ${this.cropRight - this.cropWidth}px ${
        this.cropBottom
      }px, ${this.cropRight - this.cropWidth}px 100%, 100% 100%, 100% 0%)`;
      this.drawCanvas();
    }
  }

  setImageClip() {
    const widthDifference = this.imageWidth - this.sourceImageWidth;
    console.log(widthDifference);

    this.imageCropX = this.cropDiffLeft;
    this.imageX = this.cropX;
    this.imageWidth = this.cropWidth;
    this.imageCropWidth = this.cropWidth;

    /*this.imageCropY = this.cropDiffTop;
    this.imageY = this.cropY;
    this.imageHeight = this.cropHeight;
    this.imageCropHeight = this.cropHeight;*/

    this.drawCanvas();
  }

  resetClip() {
    this.imageCropX = 0;
    this.imageCropY = 0;
    this.imageCropHeight = this.sourceImageHeight;
    this.imageCropWidth = this.sourceImageWidth;
    this.imageX = this.originalX;
    this.imageY = this.originalY;
    this.imageHeight = this.originalHeight;
    this.imageWidth = this.originalWidth;
    this.imageRight = this.originalRight;
    this.imageBottom = this.originalBottom;
    this.cropX = this.imageX;
    this.cropY = this.imageY;
    this.cropRight = this.imageRight;
    this.cropBottom = this.imageBottom;
    this.cropHeight = this.imageHeight;
    this.cropWidth = this.imageWidth;
    this._currentCrop = this._originalCrop;

    this.drawCanvas();
  }
  //#endregion

  recenterImage() {
    this.imageX = this.canvasElement.width / this.dpi / 2 - this.imageWidth / 2;
    this.imageY =
      this.canvasElement.height / this.dpi / 2 - this.imageHeight / 2;
    this.imageRight = this.imageX + this.imageWidth;
    this.imageBottom = this.imageY + this.imageHeight;
    this.drawCanvas();
  }

  resetImageSize() {
    this.scaleX = 0;
    this.scaleY = 0;
    const dpiObject: DPIObject = ImageEditorUtilities.fixDpi(
      this.canvasElement,
      this.scaleX,
      this.scaleY
    );
    this.dpi = dpiObject.dpi;
    this.sizeDivisor = dpiObject.sizeDivisor;
    this.width = dpiObject.width;
    this.height = dpiObject.height;
    this.imageHeight = this.originalHeight;
    this.imageWidth = this.originalWidth;
    this.imageRight = this.imageX + this.imageWidth;
    this.imageBottom = this.imageY + this.imageHeight;
    if (this.imageRight > this.canvasOffset.width) {
      this.imageX -= this.imageRight - this.canvasOffset.width;
      this.imageRight = this.imageX + this.imageWidth;
    }
    if (this.imageBottom >= this.canvasOffset.height) {
      console.log(this.imageBottom, this.canvasOffset.height);
      this.imageY -= this.imageBottom - this.canvasOffset.height;
      this.imageBottom = this.imageY + this.imageHeight;
    }
    this.drawCanvas();
  }

  handleResizeHotkeys() {
    if (this.keyMap['AltLeft'] === true && this.keyMap['KeyR']) {
      this.recenterImage();
    }

    if (this.keyMap['AltLeft'] === true && this.keyMap['KeyS'] === true) {
      this.resetImageSize();
    }

    if (this.keyMap['AltLeft'] !== true && this.keyMap['ShiftLeft'] !== true) {
      if (
        this.keyMap['ControlLeft'] === true &&
        this.keyMap['ArrowUp'] === true &&
        this.imageY - 1 >= 0
      ) {
        this.imageY -= 1;
        this.imageBottom = this.imageY + this.imageHeight;
        this.drawCanvas();
      } else if (
        this.keyMap['ControlLeft'] === true &&
        this.keyMap['ArrowDown'] === true &&
        this.imageY + this.imageHeight + 1 <= this.canvasOffset.height
      ) {
        this.imageY += 1;
        this.imageBottom = this.imageY + this.imageHeight;
        this.drawCanvas();
      }

      if (
        this.keyMap['ControlLeft'] === true &&
        this.keyMap['ArrowLeft'] === true &&
        this.imageX - 1 >= 0
      ) {
        this.imageX -= 1;
        this.imageRight = this.imageX + this.imageWidth;
        this.drawCanvas();
      } else if (
        this.keyMap['ControlLeft'] === true &&
        this.keyMap['ArrowRight'] === true &&
        this.imageRight + 1 <= this.canvasOffset.width
      ) {
        this.imageX += 1;
        this.imageRight = this.imageX + this.imageWidth;
        this.drawCanvas();
      }
    }

    if (this.keyMap['ControlLeft'] === false) {
      if (
        this.keyMap['AltLeft'] === true &&
        this.keyMap['ArrowUp'] === true &&
        this.imageY - 1 >= 0
      ) {
        this.imageY -= 1;
        this.imageHeight = this.imageBottom - this.imageY;
        this.drawCanvas();
      } else if (
        this.keyMap['AltLeft'] === true &&
        this.keyMap['ArrowDown'] === true &&
        this.imageHeight + 1 >= this.minSize
      ) {
        this.imageY += 1;
        this.imageHeight = this.imageBottom - this.imageY;
        this.drawCanvas();
      }

      if (
        this.keyMap['ShiftLeft'] === true &&
        this.keyMap['ArrowLeft'] === true &&
        this.imageX - 1 >= 0
      ) {
        this.imageX -= 1;
        this.imageWidth = this.imageRight - this.imageX;
        this.drawCanvas();
      } else if (
        this.keyMap['ShiftLeft'] === true &&
        this.keyMap['ArrowRight'] === true &&
        this.imageWidth + 1 >= this.minSize
      ) {
        this.imageX += 1;
        this.imageWidth = this.imageRight - this.imageX;
        this.drawCanvas();
      }
    }

    if (
      this.keyMap['AltLeft'] === true &&
      this.keyMap['ControlLeft'] === true &&
      this.keyMap['ArrowDown'] === true &&
      this.imageY + this.imageHeight + 1 <= this.canvasOffset.height
    ) {
      this.imageHeight += 1;
      this.imageBottom = this.imageY + this.imageHeight;
      this.drawCanvas();
    } else if (
      this.keyMap['AltLeft'] === true &&
      this.keyMap['ControlLeft'] === true &&
      this.keyMap['ArrowUp'] === true &&
      this.imageHeight - 1 >= this.minSize
    ) {
      this.imageHeight -= 1;
      this.imageBottom = this.imageY + this.imageHeight;
      this.drawCanvas();
    }

    if (
      this.keyMap['ControlLeft'] === true &&
      this.keyMap['AltLeft'] === true &&
      this.keyMap['ArrowRight'] === true &&
      this.imageWidth + 1 <= this.canvasOffset.width
    ) {
      this.imageWidth += 1;
      this.imageRight = this.imageX + this.imageWidth;
      this.drawCanvas();
    } else if (
      this.keyMap['ControlLeft'] === true &&
      this.keyMap['AltLeft'] === true &&
      this.keyMap['ArrowLeft'] === true &&
      this.imageWidth + 1 >= this.minSize
    ) {
      this.imageWidth -= 1;
      this.imageRight = this.imageX + this.imageWidth;
      this.drawCanvas();
    }
  }

  handleResizeScroll(event) {
    if (this.draggingImage === true || this.draggingResizer > -1) return;

    if (this.keyMap['AltLeft'] === true) {
      if (event.wheelDelta > 0) {
        if (this.keyMap['KeyC'] === false) this.scaleX += 0.01;
        if (this.keyMap['KeyX'] === false) this.scaleY += 0.01;

        const dpiObject: DPIObject = ImageEditorUtilities.fixDpi(
          this.canvasElement,
          this.scaleX,
          this.scaleY
        );
        this.dpi = dpiObject.dpi;
        this.sizeDivisor = dpiObject.sizeDivisor;
        this.width = dpiObject.width;
        this.height = dpiObject.height;

        this.imageX =
          this.canvasElement.width / (this.dpi + this.scaleX) / 2 -
          this.width / 2;
        this.imageY =
          this.canvasElement.height / (this.dpi + this.scaleY) / 2 -
          this.height / 2;

        this.imageRight = this.imageX + this.imageWidth;
        this.imageBottom = this.imageY + this.imageHeight;
        this.drawCanvas();
      } else if (event.wheelDelta < 0) {
        if (this.keyMap['KeyC'] === false) this.scaleX -= 0.01;
        if (this.keyMap['KeyX'] === false) this.scaleY -= 0.01;

        const dpiObject: DPIObject = ImageEditorUtilities.fixDpi(
          this.canvasElement,
          this.scaleX,
          this.scaleY
        );
        this.dpi = dpiObject.dpi;
        this.sizeDivisor = dpiObject.sizeDivisor;
        this.width = dpiObject.width;
        this.height = dpiObject.height;

        this.imageX =
          this.canvasElement.width / (this.dpi + this.scaleX) / 2 -
          this.width / 2;
        this.imageY =
          this.canvasElement.height / (this.dpi + this.scaleY) / 2 -
          this.height / 2;

        this.imageRight = this.imageX + this.imageWidth;
        this.imageBottom = this.imageY + this.imageHeight;
        this.drawCanvas();
      }
    }
  }
  //#endregion

  //#region Hotkey Events
  handleKeyPress(event: KeyboardEvent) {
    event = event || event;
    this.keyMap[event.code] = true;
    //console.log(this.keyMap);

    if (this.currentEditState === this.editState.Resize) {
      this.handleResizeHotkeys();
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    event = event || event;

    this.keyMap[event.code] = false;
  }

  onMouseWheel(event) {
    if (this.currentEditState === this.editState.Resize) {
      this.handleResizeScroll(event);
    }
  }
  //#endregion
}
