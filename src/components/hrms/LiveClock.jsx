import React, { useState, useEffect } from 'react';

export default function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="font-mono"
      style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'var(--foreground)',
        marginTop: '0.25rem',
        letterSpacing: '0.04em'
      }}
    >
      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}
