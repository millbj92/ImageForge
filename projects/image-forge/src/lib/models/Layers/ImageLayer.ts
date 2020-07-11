import { Layer } from './Layer';

export class ImageLayer extends Layer {
  constructor(
    name: string,
    img,
    private x: number,
    private y: number,
    canvasElement
  ) {
    super(name, null, null, null, canvasElement, false, false);
    this.img = img;
    this.canvasElement = canvasElement;
    this.canvasOffset = this.canvasElement.getBoundingClientRect();
    this.offsetX = this.canvasOffset.left;
    this.offsetY = this.canvasOffset.top;
    this.positionRight = this.positionX + this.width;
    this.positionBottom = this.positionY + this.height;
    this.currentEditState = this.editState.Resize;
    //this.loadImage();
  }

  loadImage() {
    this.width = this.img.width;
    this.height = this.img.height;
    this.positionX = this.x - this.width / 2;
    this.positionY = this.y - this.height / 2;
    this.background.color = [0, 0, 0, 0];
    this.sourceImageHeight = this.img.height;
    this.sourceImageWidth = this.img.width;
    this.sourceDifferenceWidth = this.width - this.sourceImageWidth;
    this.sourceDifferenceHeight = this.height - this.sourceImageHeight;

    this.imageWidth = this.img.width;
    this.imageHeight = this.img.height;
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
    this.positionRight = this.positionX + this.width;
    this.positionBottom = this.positionY + this.height;
  }
}
