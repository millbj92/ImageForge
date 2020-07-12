import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DPIObject, ImageEditorUtilities } from '../models/Utilities';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private canvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private canvasOffset;
  public canvasChanged: Subject<any> = new Subject<any>();
  public canvasContextChanged: Subject<CanvasRenderingContext2D> = new Subject<
    CanvasRenderingContext2D
  >();
  public canvasOffsetChanged: Subject<any> = new Subject<any>();

  getElement() {
    return this.canvasElement;
  }

  constructor() {
    this.canvasChanged.subscribe((canvasElement) => {
      this.canvasElement = canvasElement;
      const dpiObject: DPIObject = ImageEditorUtilities.fixDpi(
        this.canvasElement,
        0,
        0
      );
      this.canvasContext = dpiObject.canvasContext;
      this.canvasOffset = this.canvasElement.getBoundingClientRect();
      this.canvasContextChanged.next(this.canvasContext);
      this.canvasOffsetChanged.next(this.canvasOffset);
    });
  }
}
