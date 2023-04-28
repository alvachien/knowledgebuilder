import { Pipe, PipeTransform } from '@angular/core';
import { AppNavItem, AppNavItemGroupEnum } from '../models';

@Pipe({
  name: 'navItemFilter',
})
export class NavItemFilterPipe implements PipeTransform {
  transform(allItems: AppNavItem[], args?: AppNavItemGroupEnum): AppNavItem[] {
    return allItems.filter((value: AppNavItem) => {
      if (args !== undefined) {
        return value.group === args;
      }

      return true;
    });
  }
}
