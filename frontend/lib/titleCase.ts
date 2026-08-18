const titleCase = (str: string) => {
  if (!str) return '';

  return str
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default titleCase;