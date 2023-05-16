import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChineseChessComponent } from './chinese-chess.component';

describe('ChineseChessComponent', () => {
  let component: ChineseChessComponent;
  let fixture: ComponentFixture<ChineseChessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChineseChessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChineseChessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
