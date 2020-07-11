import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { LayerService } from '../shared/layer.service';
import { Layer } from '../models/Layers/Layer';

@Component({
  selector: 'layer-panel',
  templateUrl: './layer-panel.component.html',
  styleUrls: ['./layer-panel.component.scss'],
})
export class LayerPanelComponent implements OnInit, AfterViewInit {
  @Input() showPanel = false;
  selectedLayer: Layer;
  Layers: Layer[];

  constructor(private layerService: LayerService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.layerService.layersChanged.subscribe((layers: Layer[]) => {
      this.Layers = layers;
    });

    this.layerService.selectedLayerChanged.subscribe((layer: Layer) => {
      this.selectedLayer = layer;
    });
  }

  toggleLocked(layer: Layer, event: MouseEvent) {
    event.stopPropagation();
    this.layerService.toggleLocked(layer);
  }

  toggleVisibility(layer: Layer, event: MouseEvent) {
    event.stopPropagation();
    this.layerService.toggleVisibility(layer);
  }

  toggleOutline(layer: Layer, event: MouseEvent) {
    event.stopPropagation();
    this.layerService.toggleOutline(layer);
  }

  layerDropped(event) {
    this.layerService.moveLayer(event);
  }

  selectLayer(layer: Layer) {
    this.layerService.selectLayer(layer);
  }

  deleteLayer(layer: Layer) {
    this.layerService.deleteLayer(layer);
  }
}
