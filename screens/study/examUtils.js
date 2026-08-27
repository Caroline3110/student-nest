export const getDaysUntil = (d) => {
  if (!d || isNaN(Date.parse(d))) {
    return 'error, please add a valid date';
  }

  const exam = new Date(d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  const days = Math.ceil((exam - now) / 86400000);

  if (days < -365) {
    return 'error, please add a valid date';
  }

  if (days > 1095) {
    return 'error, date cannot be more than 3 years away';
  }

  return days;
};
