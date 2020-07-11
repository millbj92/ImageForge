import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerPropertiesPanelComponent } from './layer-properties-panel.component';

describe('LayerPropertiesPanelComponent', () => {
  let component: LayerPropertiesPanelComponent;
  let fixture: ComponentFixture<LayerPropertiesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerPropertiesPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerPropertiesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
