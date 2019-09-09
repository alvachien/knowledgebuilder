
export function addClass(obj: HTMLElement, cls: string): void {
  let obj_class = obj.className;
  let blank = (obj_class !== '') ? ' ' : '';
  let added = obj_class + blank + cls;
  obj.className = added;
}
    
export function removeClass(obj: HTMLElement, cls: string): void {
  let obj_class = ' '+ obj.className + ' ';
  obj_class = obj_class.replace(/(\s+)/gi, ' '); //' abc    bcd ' -> ' abc bcd '
  
  let removed = obj_class.replace(' ' + cls + ' ', ' '); //' abc bcd ' -> 'bcd '
  removed = removed.replace(/(^\s+)|(\s+$)/g, ''); // ' bcd ' -> 'bcd'
  obj.className = removed;
}
    
export function hasClass(obj: HTMLElement, cls: string): boolean {
  let obj_class = obj.className;
  let obj_class_lst: string[] = obj_class.split(/\s+/);
  
  for(let x in obj_class_lst) {
    if(obj_class_lst[x] === cls) {
      return true;
    }
  }
  return false;
}
