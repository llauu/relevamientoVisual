import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CosasLindasPage } from './cosas-lindas.page';

describe('CosasLindasPage', () => {
  let component: CosasLindasPage;
  let fixture: ComponentFixture<CosasLindasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CosasLindasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
