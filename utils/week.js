// Utility functions for week calculations

// Get current week start date for adding tasks
// If today is Sunday, return next Monday. Otherwise return this Monday.
const getWeekStartDate = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (day === 0) {
    // If today is Sunday, return next Monday
    const nextMonday = new Date(d);
    nextMonday.setDate(d.getDate() + 1); // Next day (Monday)
    return nextMonday;
  } else {
    // If today is Monday-Saturday, return this Monday
    const diff = d.getDate() - day + 1; // Adjust to Monday
    return new Date(d.setDate(diff));
  }
};

// Get current week end date for adding tasks
// If today is Sunday, return next Sunday. Otherwise return this Sunday.
const getWeekEndDate = (date = new Date()) => {
  const weekStart = getWeekStartDate(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday (6 days after Monday)
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

// Get previous week start date for reflection
// If today is Sunday, return this Monday. Otherwise return previous Monday.
const getPreviousWeekStartDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  
  if (day === 0) {
    // If today is Sunday, return this Monday (same week)
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - 6); // 6 days before Sunday = Monday
    return thisMonday;
  } else {
    // If today is Monday-Saturday, return previous Monday
    const weekStart = getWeekStartDate(today);
    weekStart.setDate(weekStart.getDate() - 7);
    return weekStart;
  }
};

// Get previous week end date for reflection
// If today is Sunday, return today (same week). Otherwise return previous Sunday.
const getPreviousWeekEndDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  
  if (day === 0) {
    // If today is Sunday, return today (same week)
    const weekEnd = new Date(today);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  } else {
    // If today is Monday-Saturday, return previous Sunday
    const weekStart = getPreviousWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }
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

