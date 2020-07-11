import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LayerService } from '../../shared/layer.service';
import { Layer } from '../../models/Layers/Layer';
import { isUndefined } from 'util';

@Component({
  selector: 'layer-properties-panel',
  templateUrl: './layer-properties-panel.component.html',
  styleUrls: ['./layer-properties-panel.component.scss'],
})
export class LayerPropertiesPanelComponent implements OnInit, AfterViewInit {
  showPanel = false;
  selectedLayer: Layer;
  constructor(private layerService: LayerService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.layerService.selectedLayerChanged.subscribe((layer) => {
      this.selectedLayer = layer;
      this.showPanel = true;
    });
  }

  changeLayerOpacity(event) {
    this.selectedLayer.changeOpacity(event);
    this.layerService.editLayer();
  }
}
