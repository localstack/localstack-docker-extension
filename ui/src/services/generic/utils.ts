export function Capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeNullBytes(str: string){
  return str.split('').filter(char => char.codePointAt(0)).join('');
}
