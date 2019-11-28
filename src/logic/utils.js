function getXML(str) {
  const parser = new DOMParser();
  const xdocument = parser.parseFromString(str, 'text/xml');
  return xdocument.firstChild;
}

export {
  getXML,
};
