import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ImageForgeComponent } from './image-forge.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragdropDirective } from './dragdrop.directive';
import { LayerdragDirective } from './layerdrag.directive';
import { DragcontainerDirective } from './dragcontainer.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { LayerPanelComponent } from './layer-panel/layer-panel.component';
import { LayerPropertiesPanelComponent } from './layer-panel/layer-properties-panel/layer-properties-panel.component';
import { LayerDragDirective } from './shared/layer-drag.directive';

@NgModule({
  declarations: [
    ImageForgeComponent,
    DragdropDirective,
    LayerdragDirective,
    DragcontainerDirective,
    FilterPanelComponent,
    LayerPanelComponent,
    LayerPropertiesPanelComponent,
    LayerDragDirective,
  ],
  imports: [CommonModule, FormsModule, DragDropModule],
  exports: [ImageForgeComponent, DragdropDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageForgeModule {}
