import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageForgeComponent } from './image-forge.component';

describe('ImageForgeComponent', () => {
  let component: ImageForgeComponent;
  let fixture: ComponentFixture<ImageForgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageForgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageForgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
