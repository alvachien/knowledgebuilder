import { NavItemFilterPipe } from './nav-item-filter.pipe';
import { AppNavItem, AppNavItemGroupEnum } from '../models';

describe('NavItemFilterPipe', () => {
  let pipe: NavItemFilterPipe;
  let allItems: AppNavItem[];
  
  beforeAll(() => {
    allItems = [
      {
        name: 'WelcomePage',
        route: '/welcome',
        group: AppNavItemGroupEnum.home,
      }
    ];
  });

  beforeEach(() => {
    pipe = new NavItemFilterPipe();
  });
  
  it('create an instance', () => {    
    expect(pipe).toBeTruthy();
  });

  it('shall filter for home', () => {
    let expitem = pipe.transform(allItems, AppNavItemGroupEnum.home);
    expect(expitem.length).toEqual(1);
  });

  it('shall filter nothing', () => {
    let expitem = pipe.transform(allItems);
    expect(expitem.length).toEqual(allItems.length);
  });
});
