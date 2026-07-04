import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureWizard } from './feature-wizard';

describe('FeatureWizard', () => {
  let component: FeatureWizard;
  let fixture: ComponentFixture<FeatureWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureWizard],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
