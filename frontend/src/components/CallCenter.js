import { useEffect, useMemo } from 'react';
import NavBar from './NavBar';
import CallProgress from './CallProgress';

function CallCenter({ calls }) {
  // normalize to an array
  const list = useMemo(() => (Array.isArray(calls) ? calls : (calls?.calls || [])), [calls]);

  // log whenever calls change
  useEffect(() => {
    console.log('📞 CallCenter list length:', list.length);
    if (list[0]) console.log('🔎 First call sample:', list[0]);
  }, [list]);

  if (!list.length) {
    return (
      <div>
        <NavBar />
        <div style={{ padding: 12, opacity: 0.7 }}>No calls yet…</div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      {list.map((call, i) => (
        <CallProgress key={call?.CallSid || call?.id || `${i}-${(crypto?.randomUUID?.() || i)}`} call={call} />
      ))}
    </div>
  );
}

export default CallCenter;
