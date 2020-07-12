import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
@Component({
  selector: 'dc-drawer-panel',
  templateUrl: './drawer-panel.component.html',
  styleUrls: ['./drawer-panel.component.scss'],
})
export class DrawerPanelComponent implements OnInit, OnChanges {
  @Input() position = 'left';
  @Input() height: number = 100;
  @Input() width: number = 20;
  @Input() showPanel: boolean = false;
  positionStyle: Object = {};
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    this.openClose(changes.showPanel.currentValue);
  }

  openClose(open: boolean) {
    if (this.position === 'left' || this.position === 'right') {
      this.positionStyle['max-width'] =
        open === true ? this.width + 'rem' : 0 + 'rem';
      this.positionStyle['visibility'] = open === true ? 'visible' : 'none';
      this.positionStyle['opacity'] = open === true ? '1' : '0';
    } else {
      this.positionStyle['max-height'] =
        open === true ? this.height + 'rem' : 0 + 'rem';
      this.positionStyle['visibility'] = open === true ? 'visible' : 'none';
      this.positionStyle['opacity'] = open === true ? '1' : '0';
    }
  }

  ngOnInit(): void {
    console.log(this.position);
    switch (this.position) {
      case 'left':
        this.positionStyle = {
          left: 0,
          height: this.height + '%',
          width: this.width + 'rem',
          'max-width': this.showPanel ? this.width + 'rem' : 0,
          opacity: this.showPanel ? 1 : 0,
          visibility: this.showPanel ? 'visible' : 'hidden',
        };
        break;
      case 'right':
        this.positionStyle = {
          right: 0,
          height: this.height + '%',
          width: this.width + 'rem',
          'max-width': this.showPanel ? this.width + 'rem' : 0,
          opacity: this.showPanel ? 1 : 0,
          visibility: this.showPanel ? 'visible' : 'hidden',
        };
        break;
      case 'top':
        this.positionStyle = {
          top: 0,
          height: this.height + 'rem',
          width: this.width + '%',
          'max-height': this.showPanel ? this.height + 'rem' : 0,
          opacity: this.showPanel ? 1 : 0,
          visibility: this.showPanel ? 'visible' : 'hidden',
        };
        break;
      case 'bottom':
        this.positionStyle = {
          bottom: 0,
          height: this.height + 'rem',
          width: this.width + '%',
          'max-height': this.showPanel ? this.height + 'rem' : 0,
          opacity: this.showPanel ? 1 : 0,
          visibility: this.showPanel ? 'visible' : 'hidden',
        };
    }
  }
}
