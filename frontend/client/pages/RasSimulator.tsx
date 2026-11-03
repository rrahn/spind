import React, { useState } from 'react';
import './RasSimulator.css';

type Allocation = {
  simulator: true;
  lockId: string;
  allocationId: string | null;
  bookingReference: string | null;
  status: 'unallocated' | 'scheduled' | 'active' | 'expired';
  version: number;
  validFrom: string | null;
  validUntil: string | null;
};

function isAllocation(value: unknown): value is Allocation {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.simulator === true && typeof record.lockId === 'string'
    && typeof record.version === 'number'
    && ['unallocated', 'scheduled', 'active', 'expired'].includes(String(record.status))
    && ['allocationId', 'bookingReference', 'validFrom', 'validUntil'].every(
      key => record[key] === null || typeof record[key] === 'string',
    );
}

export default function RasSimulator() {
  const [token, setToken] = useState('');
  const [lockId, setLockId] = useState('locker-1-1');
  const [bookingReference, setBookingReference] = useState('demo-booking');
  const [validUntil, setValidUntil] = useState('');
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmRotation, setConfirmRotation] = useState(false);
  const [pending, setPending] = useState<{ path: string; key: string; body: object } | null>(null);

  async function request(path: string, method: 'GET' | 'POST', body?: object, key?: string) {
    setBusy(true);
    setError('');
    setCode(null);
    try {
      const response = await fetch(`/api/ras-simulator/locks/${encodeURIComponent(lockId)}/${path}`, {
        method,
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(key ? { 'Idempotency-Key': key } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (response.status === 404) throw new Error('Simulator disabled or lock not allocated yet. Check server configuration, or allocate this lock.');
      const result: unknown = await response.json();
      if (!response.ok) {
        if (response.status < 500) setPending(null);
        const message = result && typeof result === 'object' && 'error' in result ? String(result.error) : 'Request failed.';
        throw new Error(message);
      }
      if (!isAllocation(result)) throw new Error('Unexpected simulator response.');
      setAllocation(result);
      if (path === 'reveal' && 'code' in result && typeof result.code === 'string') setCode(result.code);
      setPending(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Simulator request failed.');
    } finally {
      setBusy(false);
    }
  }

  function mutate(path: string, body: object) {
    const operation = { path, body, key: crypto.randomUUID() };
    setPending(operation);
    void request(path, 'POST', body, operation.key);
  }

  const current = allocation?.lockId === lockId ? allocation : null;
  return (
    <main className="ras-workbench">
      <a href="/">Back to existing booking prototype</a>
      <h1>Lock access simulator</h1>
      <p className="ras-warning"><strong>Simulation only.</strong> Generated codes cannot open real locks.
        This is our development interface, not the Euro-Locks API. No booking or payment is created.</p>
      <form onSubmit={event => {
        event.preventDefault();
        if (!validUntil) return;
        mutate('allocations', { bookingReference, validFrom: new Date().toISOString(), validUntil: new Date(validUntil).toISOString() });
      }}>
        <label>Simulator token
          <input type="password" autoComplete="off" value={token} required disabled={busy || !!pending}
            onChange={event => { setToken(event.target.value); setCode(null); setAllocation(null); }} />
        </label>
        <p>Kept in memory only. Use synthetic references, never pupil names.</p>
        <label>Simulated lock identifier
          <input value={lockId} pattern={'[A-Za-z0-9_\\-]{1,80}'} required disabled={busy || !!pending}
            onChange={event => { setLockId(event.target.value); setAllocation(null); setCode(null); setConfirmRotation(false); }} />
        </label>
        <label>Opaque booking reference
          <input value={bookingReference} pattern={'[A-Za-z0-9_\\-]{1,100}'} required disabled={busy || !!pending}
            onChange={event => setBookingReference(event.target.value)} />
        </label>
        <label>Access ends (your local time)
          <input type="datetime-local" value={validUntil} required disabled={busy || !!pending}
            onChange={event => setValidUntil(event.target.value)} />
        </label>
        <div className="ras-actions">
          <button type="submit" disabled={busy || !!pending}>Allocate simulated code</button>
          <button type="button" disabled={busy || !token || !lockId || !!pending}
            onClick={() => void request('', 'GET')}>Refresh status</button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      {pending && !busy && <aside>
        <p>The outcome may be unknown. Retry the same operation before starting another.</p>
        <button onClick={() => void request(pending.path, 'POST', pending.body, pending.key)}>Retry safely</button>
      </aside>}
      <section aria-live="polite" aria-busy={busy}>
        {busy && <p>Contacting simulator...</p>}
        {current && <>
          <h2>Simulated allocation</h2>
          <dl>
            <dt>Lock</dt><dd>{current.lockId}</dd>
            <dt>Status</dt><dd>{current.status}</dd>
            <dt>Reference</dt><dd>{current.bookingReference || 'None'}</dd>
            <dt>Version</dt><dd>{current.version}</dd>
            <dt>Starts</dt><dd>{current.validFrom ? new Date(current.validFrom).toLocaleString() : 'Not set'}</dd>
            <dt>Ends</dt><dd>{current.validUntil ? new Date(current.validUntil).toLocaleString() : 'Not set'}</dd>
          </dl>
          {['active', 'scheduled'].includes(current.status) && <div className="ras-actions">
            <button disabled={busy || !!pending} onClick={() => code ? setCode(null) : void request('reveal', 'POST')}>
              {code ? 'Hide code' : 'Reveal simulated code'}
            </button>
            <button disabled={busy || !!pending} onClick={() => setConfirmRotation(true)}>Request new code</button>
          </div>}
          {code && <p className="ras-code">Simulated code: <strong>{code}</strong></p>}
          {confirmRotation && <div role="group" aria-label="Confirm code replacement">
            <p>Replace this simulated code? This says nothing about real offline-lock revocation.</p>
            <button disabled={busy || !!pending} onClick={() => {
              setConfirmRotation(false);
              mutate('rotate', { allocationId: current.allocationId });
            }}>Confirm replacement</button>
            <button disabled={busy} onClick={() => setConfirmRotation(false)}>Cancel</button>
          </div>}
        </>}
      </section>
    </main>
  );
}
