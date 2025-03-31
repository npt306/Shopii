export function sortObject(obj: any): any {
    const sorted: any = {};
    const str: string[] = [];
    let key: string; 
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
      const sortedKey = str[i];
      sorted[sortedKey] = encodeURIComponent(obj[decodeURIComponent(sortedKey)]).replace(/%20/g, '+');
    }
    return sorted;
  }
  