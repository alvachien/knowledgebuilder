import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCityComponent } from './battle-city.component';

describe('BattleCityComponent', () => {
  let component: BattleCityComponent;
  let fixture: ComponentFixture<BattleCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BattleCityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
