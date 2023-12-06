export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeNullBytes(str: string): string {
  return str.split('').filter(char => char.codePointAt(0)).join('');
}

const EXCLUDED_OS_WSL = ['docker-desktop', 'docker-desktop-data'];

export function getOSsFromBinary(res: string): string[] {
  return res.split('\n').slice(3, -1) // get only the wsl items
    .map(str => removeNullBytes(str).split(' ').filter((subStr: string) => subStr.length > 0) // remove space and null bytes
      .slice(0, -2)) // remove status and final /r
    .sort((a, b) => b.length - a.length) // put the selected OS as first of the list (it has * in front)
    .map(distro => distro.slice(-1).pop()) // get only the name as string of the distro found (ex. [["*","Ubuntu"],["Fedora"]] => ["Ubuntu","Fedora"])
    .filter(distro => !EXCLUDED_OS_WSL.includes(distro));
}

const EXCLUDED_USER_WSL = ['[.]', '[..]', '\r'];

export function getUsersFromBinaryWindows(res: string): string[] {
  return res.split('\n').filter(string => string.startsWith('[')) // get only directory rows (they are in form "[user1] [user2]" )
    .map(elem => elem.split(' ').filter(item => item.length > 0 && !EXCLUDED_USER_WSL.includes(item)))// get only dir names
    .reduce((accumulator, currentValue) => accumulator.concat(currentValue), []) // combine multiple lines into one
    .map(user => user.slice(1, -1)); // remove "[" and "]" from names
}

export function getUsersFromBinaryUnix(res: string): string[] {
  return res.split('\n').slice(0, -1);
}

export function isJson(item: string) {
  let value = item;
  try {
    value = JSON.parse(item);
  } catch (e) {
    return false;
  }

  return typeof value === 'object' && value !== null;
}
