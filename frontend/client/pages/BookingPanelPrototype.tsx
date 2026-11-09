// Variant B: synthetic locker actions, no API calls or persistence.
import React, { useEffect, useRef, useState } from 'react';
import './BookingPanelPrototype.css';

type Booking = { id: number; childId: number; childName: string; locker: string; year: string; location: string; ended: boolean };
type Child = { id: number; name: string; room: string };
type Modal = { kind: 'code' | 'problem' | 'cancel' | 'map'; booking: Booking };
const archiveExamples: Booking[] = [
    { id: 3, childId: 1, childName: 'Mila Beispiel', locker: 'A-012', year: '2025/26', location: 'Erdgeschoss', ended: true },
    { id: 4, childId: 1, childName: 'Mila Beispiel', locker: 'A-010', year: '2024/25', location: 'Erdgeschoss', ended: true },
    { id: 5, childId: 1, childName: 'Mila Beispiel', locker: 'A-008', year: '2023/24', location: 'Erdgeschoss', ended: true },
    { id: 6, childId: 1, childName: 'Mila Beispiel', locker: 'A-006', year: '2022/23', location: 'Erdgeschoss', ended: true },
    { id: 7, childId: 1, childName: 'Mila Beispiel', locker: 'A-004', year: '2021/22', location: 'Erdgeschoss', ended: true },
];

function MapIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z M9 3v16 M15 5v16" /></svg>;
}

function BookingField({ caption, children }: { caption: string; children: React.ReactNode }) {
    return <div><dt>{caption}</dt><dd>{children}</dd></div>;
}

export default function BookingPanelPrototype({ children, bookings, bookingOpen }: { children: Child[]; bookings: Booking[]; bookingOpen: boolean }) {
    const [cancelled, setCancelled] = useState<number[]>([]);
    const [problems, setProblems] = useState<Record<number, string>>({});
    const [codes, setCodes] = useState<Record<number, string>>({});
    const [modal, setModal] = useState<Modal | null>(null);
    const [confirm, setConfirm] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [problem, setProblem] = useState('Schloss defekt');
    const [message, setMessage] = useState('');
    const dialog = useRef<HTMLDialogElement>(null);
    const current = bookings.filter(booking => !booking.ended && !cancelled.includes(booking.id));
    const history = [...bookings.filter(booking => booking.ended || cancelled.includes(booking.id)), ...archiveExamples];
    const eligible = children.filter(child => !current.some(booking => booking.childId === child.id));
    const childName = (booking: Booking) => children.find(child => child.id === booking.childId)?.name || booking.childName;

    useEffect(() => {
        if (modal) dialog.current?.showModal();
        else dialog.current?.close();
    }, [modal]);

    function open(kind: Modal['kind'], booking: Booking) {
        setConfirm(false);
        setRegenerating(false);
        setProblem('Schloss defekt');
        setModal({ kind, booking });
    }

    return <section className="pp-booking-panel pp-compact-panel" aria-labelledby="pp-bookings-heading">
        <div className="pp-section-heading"><h1 id="pp-bookings-heading">Meine Schließfächer</h1><span className="pp-count">{current.length} gebucht</span></div>
        <div className="pp-locker-bookings">{current.map(booking => <article className={`pp-compact-booking pp-rearranged-booking ${problems[booking.id] ? 'pp-has-problem' : ''}`} key={booking.id}>
            <div className="pp-small-locker">
                <span className="pp-locker-vents" aria-hidden="true" />
                <div className="pp-locker-center"><strong>{booking.locker}</strong>
                    <button onClick={() => open('code', booking)}>Code anzeigen</button>
                </div>
                <span className="pp-locker-handle" aria-hidden="true" />
            </div>
            <div className="pp-compact-info">
                <h2 className="pp-booking-child-name">{childName(booking)}</h2>
                {problems[booking.id] && <div className="pp-booking-badges"><span className="pp-tag pp-problem-tag">Problem gemeldet · Offen</span></div>}
                <dl className="pp-booking-meta">
                    <BookingField caption="Buchungszeitraum">Schuljahr {booking.year}</BookingField>
                    <BookingField caption="Klassenraum">{children.find(child => child.id === booking.childId)?.room || 'Noch nicht zugeordnet'}</BookingField>
                    <div className="pp-location-field"><dt>Ort</dt><dd><span className="pp-location"><span>{booking.location}</span><button className="pp-map-button" aria-label="Ort auf Schulkarte anzeigen" onClick={() => open('map', booking)}><MapIcon /></button></span></dd></div>
                </dl>
            </div>
            <div className="pp-booking-actions">
                <span className="pp-tag pp-tag-ready pp-booking-date">Gebucht am <time dateTime="2027-08-12">12.08.2027</time></span>
                <div className="pp-secondary-actions"><h3>Weitere Aktionen</h3>
                    <button className="pp-secondary pp-report-button" onClick={() => open('problem', booking)}>{problems[booking.id] ? 'Problem ansehen' : 'Problem melden'}</button>
                    <button className="pp-secondary pp-cancel-button" onClick={() => open('cancel', booking)}>Fach kündigen</button>
                </div>
            </div>
        </article>)}</div>
        {!current.length && <p className="pp-compact-empty">Keine laufende Buchung.</p>}
        {cancelled.length > 0 && <p className="pp-notice">Vorschau: Das gekündigte Fach ist wieder frei. Es wurde kein echtes Schließfach freigegeben.</p>}
        {bookingOpen && eligible.map(child => <section className="pp-compact-availability" key={child.id}>
            <h2>Schließfach buchen</h2>
            <div className="pp-booking-offer">
                <dl className="pp-booking-meta"><BookingField caption="Kind">{child.name}</BookingField><BookingField caption="Buchungszeitraum">Schuljahr 2027/28</BookingField></dl>
                <button className="pp-primary" onClick={() => setMessage(`Vorschau: Schließfachauswahl für ${child.name}. Es wird keine echte Buchung erstellt.`)}>Jetzt buchen<span className="pp-sr-only"> für {child.name}</span></button>
            </div>
        </section>)}
        {(!bookingOpen || !eligible.length) && <section className="pp-compact-availability">
            <h2>{bookingOpen ? 'Schließfach buchen' : 'Buchung derzeit geschlossen'}</h2>
            <p>{!bookingOpen ? 'Die Verwaltung hat keine neue Buchung freigegeben. Bestehende Buchungen bleiben sichtbar.' : !children.length ? 'Registriere zuerst ein Kind in der Kinderverwaltung.' : 'Für alle Kinder ist bereits ein Schließfach gebucht.'}</p>
        </section>}
        <section className="pp-compact-history"><h2>Ältere Buchungen</h2><div className="pp-history-scroll" tabIndex={0} role="region" aria-label="Ältere Buchungen – scrollbare Liste">
            {history.map(booking => <article key={booking.id}><div><strong>{booking.locker}</strong><span>{booking.childName}</span><span>Schuljahr {booking.year}</span></div><span className="pp-tag">{cancelled.includes(booking.id) ? 'Gekündigt' : 'Beendet'}</span></article>)}
        </div></section>
        {message && <p className="pp-notice" role="status">{message}</p>}
        <dialog ref={dialog} className="pp-booking-dialog" aria-labelledby="pp-dialog-title" onCancel={() => setModal(null)} onClose={() => setModal(null)} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setModal(null); } }}>
            {modal && <>
                <div className="pp-dialog-heading"><h2 id="pp-dialog-title">{modal.kind === 'code' ? 'Zugangscode' : modal.kind === 'problem' ? 'Problem melden' : modal.kind === 'cancel' ? 'Buchung vorzeitig kündigen' : 'Ort im Schulgebäude'}</h2><button className="pp-text" aria-label="Dialog schließen" onClick={() => setModal(null)}>Schließen</button></div>
                <p>{childName(modal.booking)} · Schuljahr {modal.booking.year}</p>
                <p className="pp-form-note">Nur Vorschau · keine echten Codes, Nachrichten oder Kündigungen.</p>
                {modal.kind === 'code' && <>
                    <output className="pp-code" aria-label="Aktueller Beispielcode">{codes[modal.booking.id] || '482 619'}</output>
                    {!regenerating ? <button className="pp-secondary" onClick={() => setRegenerating(true)}>Neuen Code generieren</button> : <div className="pp-confirm-zone"><p>Der bisherige Code wird ungültig. Neuen Code wirklich generieren?</p><button className="pp-primary" onClick={() => { setCodes({ ...codes, [modal.booking.id]: codes[modal.booking.id] === '731 204' ? '482 619' : '731 204' }); setRegenerating(false); }}>Neuen Code bestätigen</button><button className="pp-text" onClick={() => setRegenerating(false)}>Abbrechen</button></div>}
                </>}
                {modal.kind === 'map' && <div className="pp-map-placeholder"><MapIcon /><strong>{modal.booking.location}</strong><p>Klassenraum: {children.find(child => child.id === modal.booking.childId)?.room || 'Noch nicht zugeordnet'}</p><p>Die Schulkarte mit Klassenraum und Schließfach ist ein geplantes Feature. Diese Vorschau zeigt noch keinen Grundriss.</p></div>}
                {modal.kind === 'problem' && (problems[modal.booking.id] ? <div className="pp-confirm-zone"><strong>Problem offen: {problems[modal.booking.id]}</strong><p>Vorschau: Meldung erfasst. Kommunikation mit der Verwaltung und Benachrichtigungen folgen in einem separaten Sprint.</p></div> : <form onSubmit={event => { event.preventDefault(); setProblems({ ...problems, [modal.booking.id]: problem }); setMessage('Vorschau: Problem gemeldet. Das Fach ist orange markiert; keine Nachricht wurde versendet.'); setModal(null); }}>
                    <label>Was ist beschädigt?<select value={problem} onChange={event => setProblem(event.target.value)}><option>Schloss defekt</option><option>Schranktür defekt</option><option>Sonstiges</option></select></label>
                    <label>Beschreibung<textarea required placeholder="Nur erfundene Angaben verwenden" /></label>
                    <button className="pp-primary">Problem melden</button>
                </form>)}
                {modal.kind === 'cancel' && <div className="pp-danger-zone"><strong>Diese Aktion kann nicht rückgängig gemacht werden.</strong><p>Die Buchung endet sofort. Das Fach wird wieder frei und kann neu vergeben werden. Bitte vorher vollständig leeren. Eine Erstattung ist hier nicht zugesagt.</p><label><input type="checkbox" checked={confirm} onChange={event => setConfirm(event.target.checked)} /> Ich habe das Fach geleert und möchte die Buchung unwiderruflich beenden.</label><button className="pp-danger-button" disabled={!confirm} onClick={() => { setCancelled([...cancelled, modal.booking.id]); setMessage('Vorschau: Buchung gekündigt, Fach wieder frei. Keine echte Kündigung durchgeführt.'); setModal(null); }}>Jetzt endgültig kündigen</button></div>}
            </>}
        </dialog>
    </section>;
}
