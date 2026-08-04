/**
 * DSA Helper: Interval Overlap Check
 * Two closed intervals [startA, endA] and [startB, endB] overlap if and only if:
 * max(startA, startB) <= min(endA, endB)
 *
 * For booking interval scheduling, if startA < endB and startB < endA, they overlap.
 */
const doIntervalsOverlap = (startA, endA, startB, endB) => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return Math.max(sA, sB) <= Math.min(eA, eB);
};

module.exports = doIntervalsOverlap;
