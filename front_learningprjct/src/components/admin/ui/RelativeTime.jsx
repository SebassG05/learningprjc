/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { absoluteDate, relativeTime } from '../shared/adminFormat';

// «hace 3 días» con la fecha completa en el tooltip y en dateTime (los lectores de pantalla la leen)
const RelativeTime = memo(function RelativeTime({ date, className = '' }) {
  if (!date) return null;
  const abs = absoluteDate(date);
  return (
    <time dateTime={new Date(date).toISOString()} title={abs} aria-label={abs} className={className}>
      {relativeTime(date)}
    </time>
  );
});

export default RelativeTime;
