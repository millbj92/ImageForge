import { Injectable, EventEmitter } from '@angular/core';
import { Layer } from '../models/Layers/Layer';
import { BehaviorSubject, Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CanvasService } from './canvas.service';
import { ImageLayer } from '../models/Layers/ImageLayer';
import { isUndefined } from 'util';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private layers: Layer[] = [];
  public layersChanged: BehaviorSubject<Layer[]> = new BehaviorSubject<Layer[]>(
    this.layers
  );

  private selectedLayer: Layer;
  public selectedLayerChanged: Subject<Layer> = new Subject<Layer>();
  public layerEdited: EventEmitter<any> = new EventEmitter();

  getLayers() {
    return this.layers.slice();
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.layersChanged.next(this.layers.slice());
    this.selectLayer(layer);
  }

  addImage(image, x, y) {
    let img = new Image();
    const objectUrl = URL.createObjectURL(image);
    const index = this.layers.filter((x) => x instanceof ImageLayer).length + 1;
    img.onload = () => {
      let imgLayer = new ImageLayer(
        `Image ${index}`,
        img,
        x,
        y,
        this.canvasService.getElement()
      );
      imgLayer.loadImage();
      this.addLayer(imgLayer);
      URL.revokeObjectURL(objectUrl);
      this.selectLayer(imgLayer);
    };
    img.src = objectUrl;
  }

  deleteLayer(layer: Layer) {
    if (layer.locked) return;

    this.layers = this.layers.filter((x) => x !== layer);
    this.layersChanged.next(this.layers.slice());
  }

  editLayer() {
    this.layerEdited.emit();
  }

  moveLayer(event: CdkDragDrop<Layer[]>) {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
    this.layersChanged.next(this.layers.slice());
  }

  toggleLocked(layer: Layer) {
    layer.locked = !layer.locked;
    this.layerEdited.emit();
  }

  toggleVisibility(layer: Layer) {
    layer.visible = !layer.visible;
    this.layerEdited.emit();
  }

  toggleOutline(layer: Layer) {
    layer.outline = !layer.outline;
    console.log(layer.outline);
    this.layerEdited.emit();
  }

  toggleAspectGrid(layer: Layer) {
    layer.drawAspectGrid = !layer.drawAspectGrid;
    this.layerEdited.emit();
  }

  selectLayer(layer: Layer) {
    if (!isUndefined(this.selectedLayer)) this.selectedLayer.selected = false;
    this.selectedLayer = layer;
    this.selectedLayer.selected = true;
    this.selectedLayerChanged.next(this.selectedLayer);
  }

  /*async getLayerSnapshot(layer: Layer) {
    let canvas: OffscreenCanvas = new OffscreenCanvas(
      this.selectedLayer.width,
      this.selectedLayer.height
    );
    canvas.width = this.selectedLayer.width;
    canvas.height = this.selectedLayer.height;
    this.selectedLayer.getLayerContext(canvas.getContext('2d'));
    return canvas.convertToBlob();
  }*/

  constructor(private canvasService: CanvasService) {
    this.canvasService.canvasChanged.subscribe((canvas) => {
      this.layers.push(
        new Layer(
          'Background',
          canvas.getBoundingClientRect().width,
          canvas.getBoundingClientRect().height,
          canvas.canvasContext,
          canvas,
          true,
          true
        )
      );

      this.selectLayer(this.layers[0]);
    });
  }
}
