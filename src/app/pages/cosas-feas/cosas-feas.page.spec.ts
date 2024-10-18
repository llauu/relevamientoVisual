import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CosasFeasPage } from './cosas-feas.page';

describe('CosasFeasPage', () => {
  let component: CosasFeasPage;
  let fixture: ComponentFixture<CosasFeasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CosasFeasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
