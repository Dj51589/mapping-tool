import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingContainerComponent } from './mapping-container.component';

describe('MappingContainerComponent', () => {
  let component: MappingContainerComponent;
  let fixture: ComponentFixture<MappingContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
