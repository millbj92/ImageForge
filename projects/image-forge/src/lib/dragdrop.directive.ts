import {
  Directive,
  HostListener,
  HostBinding,
  Output,
  EventEmitter,
} from '@angular/core';

@Directive({
  selector: '[dragdrop]',
})
export class DragdropDirective {
  @HostBinding('class.fileover') fileOver: boolean;
  @Output() fileDropped = new EventEmitter<any>();
  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
    let files = [];
    if (evt.dataTransfer.files.length > 0) {
      for (let file of evt.dataTransfer.files) {
        if (!file.type.startsWith('image')) continue;

        files.push(file);
      }
      this.fileDropped.emit({ files: files, x: evt.x, y: evt.y });
    }
  }
}
