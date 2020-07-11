import { TestBed } from '@angular/core/testing';

import { ImageForgeService } from './image-forge.service';

describe('ImageForgeService', () => {
  let service: ImageForgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageForgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
