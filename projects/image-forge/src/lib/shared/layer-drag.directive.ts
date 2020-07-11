import { Directive, HostListener } from '@angular/core';
import { LayerService } from './layer.service';
import { Layer } from '../models/Layers/Layer';

@Directive({
  selector: '[LayerDrag]',
})
export class LayerDragDirective {
  private selectedLayer: Layer;
  private startX: number = 0;
  private startY: number = 0;
  constructor(private layerService: LayerService) {
    layerService.selectedLayerChanged.subscribe((layer) => {
      this.selectedLayer = layer;
    });
  }

  hitLayer(x, y) {
    return (
      x > this.selectedLayer.positionX &&
      x < this.selectedLayer.positionX + this.selectedLayer.width &&
      y > this.selectedLayer.positionY &&
      y < this.selectedLayer.positionY + this.selectedLayer.height
    );
  }

  anchorHitTest(x, y) {
    let dx, dy;

    // top-left
    dx = x - this.selectedLayer.positionX;
    dy = y - this.selectedLayer.positionY;

    if (
      this.selectedLayer.currentEditState == this.selectedLayer.editState.Resize
    ) {
      if (dx * dx + dy * dy <= this.selectedLayer.rr) {
        return 0;
      }
      // top-right
      dx = x - this.selectedLayer.positionRight;
      dy = y - this.selectedLayer.positionY;
      if (dx * dx + dy * dy <= this.selectedLayer.rr) {
        return 1;
      }
      // bottom-right
      dx = x - this.selectedLayer.positionRight;
      dy = y - this.selectedLayer.positionBottom;
      if (dx * dx + dy * dy <= this.selectedLayer.rr) {
        return 2;
      }
      // bottom-left
      dx = x - this.selectedLayer.positionX;
      dy = y - this.selectedLayer.positionBottom;
      if (dx * dx + dy * dy <= this.selectedLayer.rr) {
        return 3;
      }
      return -1;
    }

    /*if (this.selectedLayer.currentEditState == this.selectedLayer.editState.Crop) {
             dx = x - this.selectedLayer.cropX;
             dy = y - this.selectedLayer.cropY;
             if (dx * dx + dy * dy <= this.selectedLayer.cr) {
               return 0;
             }
             // top-right
             dx = x - this.selectedLayer.cropRight;
             dy = y - this.selectedLayer.cropY;
             if (dx * dx + dy * dy <= this.selectedLayer.cr) {
               return 1;
             }
             // bottom-right
             dx = x - this.selectedLayer.cropRight;
             dy = y - this.selectedLayer.cropBottom;
             if (dx * dx + dy * dy <= this.selectedLayer.cr) {
               return 2;
             }
             // bottom-left
             dx = x - this.selectedLayer.cropX;
             dy = y - this.selectedLayer.cropBottom;
             if (dx * dx + dy * dy <= this.selectedLayer.cr) {
               return 3;
             }
             return -1;
           }*/

    return -1;
  }

  @HostListener('mousedown', ['$event'])
  mouseDown(e) {
    if (this.selectedLayer.locked) return;
    this.selectedLayer.startX = e.clientX - this.selectedLayer.offsetX;
    this.selectedLayer.startY = e.clientY - this.selectedLayer.offsetY;
    this.selectedLayer.resizing = this.anchorHitTest(
      this.selectedLayer.startX,
      this.selectedLayer.startY
    );
    this.selectedLayer.dragging =
      this.selectedLayer.resizing < 0 &&
      this.hitLayer(this.selectedLayer.startX, this.selectedLayer.startY);
  }

  @HostListener('mousemove', ['$event'])
  mouseMove(e) {
    if (
      this.selectedLayer.currentEditState == this.selectedLayer.editState.Resize
    ) {
      this.doResize(e);
    }
  }

  @HostListener('mouseup', ['$event'])
  mouseUp(e) {
    this.selectedLayer.resizing = -1;
    this.selectedLayer.dragging = false;
  }

  @HostListener('mouseout', ['$event'])
  mouseOut(e) {
    this.mouseUp(e);
  }

  doResize(e) {
    if (this.selectedLayer.resizing > -1) {
      let mouseX = e.clientX - this.selectedLayer.offsetX;
      let mouseY = e.clientY - this.selectedLayer.offsetY;

      // resize the image
      if (
        this.selectedLayer.currentResizeState ==
        this.selectedLayer.resizeState.Resize
      ) {
        this.selectedLayer.positionX =
          this.selectedLayer.canvasElement.width / this.selectedLayer.dpi / 2 -
          this.selectedLayer.width / 2;
        this.selectedLayer.positionY =
          this.selectedLayer.canvasElement.height / this.selectedLayer.dpi / 2 -
          this.selectedLayer.height / 2;
        switch (this.selectedLayer.resizing) {
          case 0: //top-left
            this.selectedLayer.width =
              this.selectedLayer.positionRight - mouseX;
            //this.selectedLayer.positionY=mouseY;
            this.selectedLayer.height =
              this.selectedLayer.positionBottom - mouseY;
            break;
          case 1: //top-right
            //this.selectedLayer.positionY=mouseY;
            this.selectedLayer.width = mouseX - this.selectedLayer.positionX;
            this.selectedLayer.height =
              this.selectedLayer.positionBottom - mouseY;
            break;
          case 2: //bottom-right
            this.selectedLayer.width = mouseX - this.selectedLayer.positionX;
            this.selectedLayer.height = mouseY - this.selectedLayer.positionY;
            break;
          case 3: //bottom-left
            //this.selectedLayer.positionX=mouseX;
            this.selectedLayer.width =
              this.selectedLayer.positionRight - mouseX;
            this.selectedLayer.height = mouseY - this.selectedLayer.positionY;
            break;
        }

        //this.selectedLayer.imageCropWidth = this.selectedLayer.width;
        //this.selectedLayer.imageCropHeight = this.selectedLayer.height;
      } else {
        switch (this.selectedLayer.resizing) {
          case 0: //top-left
            this.selectedLayer.positionX = mouseX;
            this.selectedLayer.width =
              this.selectedLayer.positionRight - mouseX;
            this.selectedLayer.positionY = mouseY;
            this.selectedLayer.height =
              this.selectedLayer.positionBottom - mouseY;
            break;
          case 1: //top-right
            this.selectedLayer.positionY = mouseY;
            this.selectedLayer.width = mouseX - this.selectedLayer.positionX;
            this.selectedLayer.height =
              this.selectedLayer.positionBottom - mouseY;
            break;
          case 2: //bottom-right
            this.selectedLayer.width = mouseX - this.selectedLayer.positionX;
            this.selectedLayer.height = mouseY - this.selectedLayer.positionY;
            break;
          case 3: //bottom-left
            this.selectedLayer.positionX = mouseX;
            this.selectedLayer.width =
              this.selectedLayer.positionRight - mouseX;
            this.selectedLayer.height = mouseY - this.selectedLayer.positionY;
            break;
        }
      }
      // set the image right and bottom
      this.selectedLayer.positionRight =
        this.selectedLayer.positionX + this.selectedLayer.width;
      this.selectedLayer.positionBottom =
        this.selectedLayer.positionY + this.selectedLayer.height;

      this.selectedLayer.lastX = this.selectedLayer.positionX;
      this.selectedLayer.lastY = this.selectedLayer.positionY;

      //this.selectedLayer.imageCropWidth = this.selectedLayer.width;
      //this.selectedLayer.imageCropHeight = this.selectedLayer.height;
      // redraw the image with resizing anchors
      //this.selectedLayer.layerChanged.emit();
    } else if (this.selectedLayer.dragging) {
      let mouseX = e.clientX - this.selectedLayer.offsetX;
      let mouseY = e.clientY - this.selectedLayer.offsetY;

      // move the image by the amount of the latest drag
      var dx = mouseX - this.selectedLayer.startX;
      var dy = mouseY - this.selectedLayer.startY;

      if (this.selectedLayer.keyMap['AltLeft'] === false) {
        if (
          this.selectedLayer.positionRight >=
            this.selectedLayer.canvasOffset.width &&
          dx > 0
        ) {
          this.selectedLayer.positionRight = this.selectedLayer.canvasOffset.width;
          this.selectedLayer.positionX =
            this.selectedLayer.positionRight - this.selectedLayer.width;
        } else if (
          this.selectedLayer.positionRight <=
            this.selectedLayer.canvasOffset.width &&
          dx > 0
        ) {
          this.selectedLayer.positionX += dx;
          this.selectedLayer.positionRight += dx;
        } else if (this.selectedLayer.positionX <= 0 && dx < 0) {
          this.selectedLayer.positionX = 0;
          this.selectedLayer.positionRight =
            this.selectedLayer.positionX + this.selectedLayer.width;
        } else if (this.selectedLayer.positionX >= 0 && dx < 0) {
          this.selectedLayer.positionX += dx;
          this.selectedLayer.positionRight += dx;
        }
      }

      if (this.selectedLayer.keyMap['ControlLeft'] === false) {
        if (
          this.selectedLayer.positionBottom >=
            this.selectedLayer.canvasOffset.height &&
          dy > 0
        ) {
          this.selectedLayer.positionBottom = this.selectedLayer.canvasOffset.height;
          this.selectedLayer.positionY =
            this.selectedLayer.positionBottom - this.selectedLayer.height;
        } else if (
          this.selectedLayer.positionBottom <=
            this.selectedLayer.canvasOffset.height &&
          dy > 0
        ) {
          this.selectedLayer.positionY += dy;
          this.selectedLayer.positionBottom += dy;
        } else if (this.selectedLayer.positionY <= 0 && dy < 0) {
          this.selectedLayer.positionY = 0;
          this.selectedLayer.positionBottom =
            this.selectedLayer.positionY + this.selectedLayer.height;
        } else if (this.selectedLayer.positionY >= 0 && dy < 0) {
          this.selectedLayer.positionY += dy;
          this.selectedLayer.positionBottom += dy;
        }
      }

      this.selectedLayer.startX = mouseX;
      this.selectedLayer.startY = mouseY;

      // redraw the image with border
      ///this.selectedLayer.layerChanged.emit();
    }
    this.layerService.editLayer();
  }
}
