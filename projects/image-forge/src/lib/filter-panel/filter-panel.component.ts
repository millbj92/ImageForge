import { Component, OnInit, Input } from '@angular/core';
import { Filter } from '../models/Filter';
import { DefaultFilters } from '../models/DefaultFilters';
import { LayerService } from '../shared/layer.service';
import { Layer } from '../models/Layers/Layer';
import { isUndefined } from 'util';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
})
export class FilterPanelComponent implements OnInit {
  @Input() showPanel = false;
  Filters: Filter[];
  selectedLayer: Layer;
  source =
    'https://devconnectfiles.blob.core.windows.net/images/img-mountains-montblanc-italy.jpg';
  image = new Image();
  constructor(private layerService: LayerService) {
    this.layerService.selectedLayerChanged.subscribe((layer) => {
      this.selectedLayer = layer;
      if (!isUndefined(this.selectedLayer.img)) {
        this.source = this.selectedLayer.img.src;
      }
      this.Filters = new DefaultFilters(this.selectedLayer).defaultFilters;
    });
  }

  selectClass(index) {}
  ngOnInit(): void {}
}
