export const getUTCTime = (date: string) => {
  const dateList = date.split(".");

  const utcTimeString = dateList[0];

  const utcTime = new Date(`${utcTimeString}Z`);

  return utcTime;
};
