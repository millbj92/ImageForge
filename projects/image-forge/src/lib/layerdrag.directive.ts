import { Directive, HostListener, HostBinding, Input } from '@angular/core';
import { DragService } from './drag.service';

export interface DraggableOptions {
  zone?: string;
  data?: any;
}

@Directive({
  selector: '[layerdrag]',
})
export class LayerdragDirective {
  constructor(private dragService: DragService) {}

  @HostBinding('draggable')
  get draggable() {
    return true;
  }

  @Input()
  set myDraggable(options: DraggableOptions) {
    if (options) {
      this.options = options;
    }
  }

  private options: DraggableOptions = {};

  @HostListener('dragstart', ['$event'])
  onDragStart(event) {
    const { zone = 'zone', data = {} } = this.options;

    this.dragService.startDrag(zone);

    event.dataTransfer.setData('Text', JSON.stringify(data));
  }
}
