import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawerPanelComponent } from './drawer-panel.component';

describe('DrawerPanelComponent', () => {
  let component: DrawerPanelComponent;
  let fixture: ComponentFixture<DrawerPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawerPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawerPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
