export const findSecondaryMonth = (index, dateList) => {
  const date = new Date(dateList[index]).getDate();
  if (date > 8 && date < 19) return false;
  if (date < 8) return dateList[index - 14]?.slice(0, 7);
  if (date > 19) return dateList[index + 14]?.slice(0, 7);
  return false;
};
