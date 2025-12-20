// Utility functions for week calculations

const getWeekStartDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
};

const getWeekEndDate = (date = new Date()) => {
  const weekStart = getWeekStartDate(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

const getPreviousWeekStartDate = () => {
  const today = new Date();
  const weekStart = getWeekStartDate(today);
  weekStart.setDate(weekStart.getDate() - 7);
  return weekStart;
};

const getPreviousWeekEndDate = () => {
  const weekStart = getPreviousWeekStartDate();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

module.exports = {
  getWeekStartDate,
  getWeekEndDate,
  getPreviousWeekStartDate,
  getPreviousWeekEndDate,
  formatDate,
};

