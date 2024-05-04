const pagination = (arr, pageNum, pageNth) => {
  const indexStart = (pageNth - 1) * pageNum;
  return arr.slice(indexStart, indexStart + pageNum);
};

module.exports = pagination;
