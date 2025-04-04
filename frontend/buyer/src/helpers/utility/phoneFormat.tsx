export const FormatPhoneNumber = (phone: string) => {
  let newFormat = phone.slice(1);
  return newFormat
    .split("")
    .map((char, i) => ((i + 1) % 3 === 0 ? char + " " : char))
    .join("");
};
