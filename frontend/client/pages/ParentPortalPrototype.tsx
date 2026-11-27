// Throwaway parent-portal preview: three layouts selected by ?variant=A/B/C.
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ParentPortalPrototype.css';
import BookingPanelPrototype from './BookingPanelPrototype';
import { Brand, LockerIllustration } from '../components/ParentBrand';

type Child = { id: number; name: string; className: string; room: string; locker?: string };
type Variant = 'A' | 'B' | 'C';
type Booking = { id: number; childId: number; childName: string; locker: string; year: string; location: string; ended: boolean };
const exampleBookings: Booking[] = [
    { id: 1, childId: 1, childName: 'Mila Beispiel', locker: 'B-024', year: '2027/28', location: '1. Obergeschoss · Gebäudeteil B', ended: false },
    { id: 2, childId: 1, childName: 'Mila Beispiel', locker: 'A-018', year: '2026/27', location: 'Erdgeschoss · Gebäudeteil A', ended: true },
];
const examples: Child[] = [
    { id: 1, name: 'Mila Beispiel', className: '8N', room: '204', locker: 'B-024' },
    { id: 2, name: 'Jonas Beispiel', className: '5A', room: '108' },
    { id: 3, name: 'Lea Beispiel', className: '7N', room: '203' },
];
const longNameExamples: Child[] = [
    { ...examples[0], name: 'Mila Alexandra von Hohenberg-Schneider' },
    { ...examples[1], name: 'Jonas Maximilian Becker-Langenfeld' },
    { ...examples[2], name: 'Lea Charlotte Sommer-Winterhausen' },
];
const names: Record<Variant, string> = { A: 'Kinder im Mittelpunkt', B: 'Kompakte Buchungen & Aktionen', C: 'Kinderverwaltung & Schließfächer' };

function ChildCard({ child, year, onAction }: { child: Child; year: string; onAction: (message: string) => void }) {
    return <article className="pp-child">
        <div className="pp-child-top"><span className="pp-avatar">{child.name[0]}</span><span className={`pp-tag ${child.locker ? 'pp-tag-ready' : ''}`}>{child.locker ? 'Gebucht' : 'Noch kein Schließfach'}</span></div>
        <h3>{child.name}</h3>
        <p>Klasse {child.className} <span>·</span> Raum {child.room}</p>
        <div className="pp-allocation">{child.locker ? <><small>Schließfach · {year}</small><strong>{child.locker}</strong><span>1. Obergeschoss · Gebäudeteil B</span></> : <><small>Schuljahr {year}</small><strong>Ein Platz für den Schulalltag</strong><span>Wähle ein Fach in der Nähe des Klassenraums.</span></>}</div>
        <button className={child.locker ? 'pp-secondary' : 'pp-primary'} onClick={() => onAction(child.locker ? `Buchungsdetails für ${child.name}: nur eine Vorschau, kein echter Zugangscode.` : `${child.name} ist für die Buchung ausgewählt. Die echte Schließfachauswahl wird später angebunden.`)}>{child.locker ? 'Buchung ansehen' : 'Schließfach buchen'} <span aria-hidden="true">↗</span></button>
        <button className="pp-text" onClick={() => onAction(`Die Angaben für ${child.name} lassen sich später hier bearbeiten.`)}>Kind bearbeiten</button>
    </article>;
}

export default function ParentPortalPrototype() {
    const [params, setParams] = useSearchParams();
    const variant: Variant = params.get('variant') === 'B' ? 'B' : params.get('variant') === 'C' ? 'C' : 'A';
    const dashboard = params.get('view') === 'dashboard';
    const [register, setRegister] = useState(false);
    const [children, setChildren] = useState<Child[]>(examples);
    const [year, setYear] = useState('2027/28');
    const [message, setMessage] = useState('');
    const [adding, setAdding] = useState(false);
    const [childName, setChildName] = useState('');
    const [childClass, setChildClass] = useState('5A');
    const [reviewed, setReviewed] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(true);
    const [choosingChild, setChoosingChild] = useState(false);
    const [selectedChild, setSelectedChild] = useState('');
    const [editingChild, setEditingChild] = useState<number | null>(null);
    const currentBookings = exampleBookings.filter(booking => !booking.ended);
    const oldBookings = exampleBookings.filter(booking => booking.ended);
    const eligibleChildren = children.filter(child => !currentBookings.some(booking => booking.childId === child.id));

    function navigate(view: string, nextVariant = variant) {
        setParams({ preview: 'parents', view, variant: nextVariant });
        setMessage('');
    }
    function cycle(direction: number) {
        const keys: Variant[] = ['A', 'B', 'C'];
        navigate(dashboard ? 'dashboard' : 'login', keys[(keys.indexOf(variant) + direction + 3) % 3]);
    }
    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, button, dialog, [contenteditable]')) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                cycle(event.key === 'ArrowLeft' ? -1 : 1);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [variant, dashboard]);

    function addChild(event: React.FormEvent) {
        event.preventDefault();
        if (editingChild !== null) {
            setChildren(children.map(child => child.id === editingChild ? { ...child, name: childName.trim(), className: childClass } : child));
        } else {
            setChildren([...children, { id: Date.now(), name: childName.trim(), className: childClass, room: 'Noch nicht zugeordnet' }]);
        }
        setChildName('');
        setEditingChild(null);
        setAdding(false);
        setMessage('Kinderprofil in der Vorschau aktualisiert. Die Daten werden nicht gespeichert.');
    }

    const yearControl = <label className="pp-year">Schuljahr<select value={year} onChange={event => setYear(event.target.value)}><option>2027/28</option><option>2026/27</option></select></label>;
    const addButton = <button className="pp-secondary" onClick={() => { setEditingChild(null); setChildName(''); setChildClass('5A'); setAdding(true); }}>+ Kind hinzufügen</button>;
    const historical = year !== '2027/28';
    const cards = children.map(child => <ChildCard key={child.id} child={child} year="2027/28" onAction={setMessage} />);
    const history = <section className="pp-empty"><span className="pp-eyebrow">ARCHIV · {year}</span><h3>Buchungen aus dem vergangenen Schuljahr</h3>{children.some(child => child.id === 1) ? <p>Mila Beispiel · Klasse 7N · Schließfach A-018 · Beendet</p> : <p>Keine Beispielbuchungen für dieses Schuljahr.</p>}<p>Vergangene Buchungen sind nur lesbar. Eine neue Buchung beginnt im aktuellen Buchungsjahr.</p></section>;
    const empty = <div className="pp-empty"><h3>Alles beginnt mit deinem Kind.</h3><p>Lege zuerst ein Kinderprofil an. Danach kannst du ein Schließfach auswählen.</p>{addButton}</div>;
    const archive = <section className="pp-archive"><details><summary>Vergangene Buchungen <span>{children.some(child => child.id === 1) ? '1 Beispielbuchung' : 'Keine Beispielbuchungen'}</span></summary>{children.some(child => child.id === 1) && <p>Mila Beispiel · 2026/27 · A-018 · Beendet</p>}<p>Alte Buchungen bleiben im Archiv. Ein neues Schuljahr erhält eine eigene Buchung.</p></details></section>;

    return <div className={`pp-root pp-variant-${variant}`}>
        <div className="pp-preview-label"><strong>Designvorschau</strong> · Alle Namen und Buchungen sind erfunden. Keine echte Anmeldung oder Zahlung.</div>
        {!dashboard ? <main className="pp-auth">
            <section className="pp-auth-form">
                <Brand />
                <div className="pp-auth-content">
                    <span className="pp-eyebrow">WILLKOMMEN IM ELTERNPORTAL</span>
                    <h1>{register ? 'Ein guter Anfang.' : 'Schön, dass du da bist.'}</h1>
                    <p>Kinder verwalten. Schließfächer buchen.<br />Alles an einem Ort, für jedes Schuljahr.</p>
                    <div className="pp-tabs"><button aria-pressed={!register} onClick={() => setRegister(false)}>Anmelden</button><button aria-pressed={register} onClick={() => setRegister(true)}>Registrieren</button></div>
                    <form onSubmit={event => { event.preventDefault(); navigate('dashboard'); }}>
                        <label>E-Mail-Adresse<input type="email" placeholder="name@beispiel.de" autoComplete="off" /></label>
                        <label>Passwort<input type="password" placeholder="Bitte keine echten Zugangsdaten eingeben" autoComplete="off" /></label>
                        {!register && <button type="button" className="pp-text pp-reset" onClick={() => setMessage('Passwort zurücksetzen wird später mit der sicheren Anmeldung verbunden.')}>Passwort vergessen?</button>}
                        {register && <p className="pp-form-note">Im echten Portal bestätigst du zuerst deine E-Mail-Adresse. Diese Vorschau erstellt kein Konto.</p>}
                        <button className="pp-primary" type="submit">Demo-Dashboard öffnen <span aria-hidden="true">→</span></button>
                    </form>
                    <p className="pp-form-note">Du kannst die Demo auch ohne Eingaben öffnen.</p>
                    {message && <p role="status" className="pp-notice">{message}</p>}
                </div>
                <footer>Ein Angebot deines Fördervereins · Vorschau</footer>
            </section>
            <section className="pp-auth-art"><span className="pp-art-badge">Weniger tragen. Mehr Freiraum.</span><LockerIllustration /><h2>Ein kleines Fach.<br />Ein leichterer Schultag.</h2><p>Ein sicherer Platz für Bücher, Sportsachen<br />und alles, was morgen wieder gebraucht wird.</p><div className="pp-art-dots"><span /> Für Kinder. Für Eltern. Für unsere Schule.</div></section>
        </main> : <>
            <header className="pp-header"><Brand /><nav aria-label="Elternportal"><button onClick={() => navigate('dashboard')}>Übersicht</button><button onClick={() => setMessage('Hilfe und Support werden später mit dem Portal verbunden.')}>Hilfe</button><button className="pp-account" onClick={() => navigate('login')}>Demo verlassen</button></nav></header>
            <main className="pp-dashboard">
                {variant === 'A' && <>
                    <section className="pp-welcome"><div><span className="pp-eyebrow">DEIN ELTERNPORTAL</span><h1>Hallo, Familie Beispiel.</h1><p>Ein guter Platz für jedes deiner Kinder.</p></div>{yearControl}</section>
                    <section className="pp-review"><span aria-hidden="true">✦</span><div><strong>{reviewed ? 'Klassenangaben geprüft' : 'Bereit für das neue Schuljahr?'}</strong><p>{reviewed ? 'Nur in dieser Vorschau bestätigt.' : 'Bitte prüfe die vorgeschlagenen Klassen deiner Kinder.'}</p></div><button className="pp-secondary" onClick={() => { setReviewed(true); setMessage('Klassenprüfung in der Vorschau bestätigt. Automatische Fortschreibung gehört zum separaten Backend-Sprint.'); }}>{reviewed ? 'Erneut prüfen' : 'Angaben prüfen'}</button></section>
                    <section><div className="pp-section-heading"><h2>{historical ? 'Vergangene Buchungen' : 'Meine Kinder'} <small>{children.length}</small></h2>{addButton}</div><div className="pp-card-grid">{historical ? history : children.length ? cards : empty}</div></section>{!historical && archive}
                </>}
                {(variant === 'B' || variant === 'C') && <div className="pp-management-layout">
                    <aside className="pp-management-sidebar" aria-labelledby="pp-children-heading">
                        <div className="pp-section-heading"><h2 id="pp-children-heading">Meine Kinder</h2><span className="pp-count">{children.length}</span></div>
                        <div className="pp-profile-list">{children.map(child => <article key={child.id} className="pp-profile">
                            <div className="pp-profile-heading">{variant !== 'B' && <span className="pp-avatar">{child.name[0]}</span>}<div><h3>{child.name}</h3><p>Klasse {child.className}</p></div></div>
                            <button className="pp-text" onClick={() => { setEditingChild(child.id); setChildName(child.name); setChildClass(child.className); setAdding(true); }}>Angaben bearbeiten<span className="pp-sr-only"> für {child.name}</span></button>
                        </article>)}</div>
                        {!children.length && <p className="pp-profile-empty">Noch keine Kinder registriert.</p>}
                        {addButton}
                        {variant === 'B' && <button className="pp-text" onClick={() => { setChildren(longNameExamples); setMessage('Vorschau mit erfundenen langen Namen. Keine echten Daten betroffen.'); }}>Lange Namen testen</button>}
                    </aside>
                    {variant === 'B' ? <BookingPanelPrototype children={children} bookings={exampleBookings} bookingOpen={bookingOpen} /> : <section className="pp-booking-panel" aria-labelledby="pp-bookings-heading">
                        <div className="pp-section-heading"><h1 id="pp-bookings-heading">Meine Schließfächer</h1><span className="pp-count">{currentBookings.length} gebucht</span></div>
                        <div className="pp-locker-bookings">{currentBookings.map(booking => <article className="pp-locker-booking" key={booking.id}>
                            <div className="pp-locker-visual" aria-hidden="true"><span /><strong>{booking.locker}</strong><i /></div>
                            <div className="pp-locker-info"><span className="pp-tag pp-tag-ready">Gebucht</span><h2>Schließfach {booking.locker}</h2><p>{booking.location}</p><dl><div><dt>Kind</dt><dd>{children.find(child => child.id === booking.childId)?.name || booking.childName}</dd></div><div><dt>Buchungszeitraum</dt><dd>Schuljahr {booking.year}</dd></div></dl><button className="pp-secondary" onClick={() => setMessage(`Schließfach ${booking.locker} · ${booking.location} · ${children.find(child => child.id === booking.childId)?.name || booking.childName} · ${booking.year}. Vorschau: Zugangscode und Support sind noch nicht angebunden.`)}>Buchungsdetails</button></div>
                        </article>)}</div>
                        <section className="pp-booking-availability">
                            <div><h2>{bookingOpen ? 'Schließfach buchen' : 'Buchung derzeit geschlossen'}</h2><p>{!bookingOpen ? 'Die Verwaltung hat keine neue Buchung freigegeben.' : !children.length ? 'Registriere zuerst ein Kind in der Kinderverwaltung.' : eligibleChildren.length ? `Für ${eligibleChildren.map(child => child.name).join(', ')} ist noch kein Schließfach gebucht.` : 'Für alle registrierten Kinder ist bereits ein Schließfach gebucht.'}</p><small>{bookingOpen ? 'Von der Verwaltung freigegeben · Schuljahr 2027/28' : 'Bestehende Buchungen bleiben sichtbar.'}</small></div>
                            {bookingOpen && eligibleChildren.length > 0 && <button className="pp-primary" onClick={() => { setSelectedChild(String(eligibleChildren[0].id)); setChoosingChild(true); }}>Neue Buchung</button>}
                        </section>
                        {choosingChild && bookingOpen && eligibleChildren.length > 0 && <form className="pp-booking-choice" onSubmit={event => { event.preventDefault(); const child = eligibleChildren.find(candidate => String(candidate.id) === selectedChild); if (child) setMessage(`Vorschau: Schließfachauswahl für ${child.name}. Es wird keine echte Buchung erstellt.`); }}><label>Kind für die Buchung<select required value={eligibleChildren.some(child => String(child.id) === selectedChild) ? selectedChild : ''} onChange={event => setSelectedChild(event.target.value)}><option value="" disabled>Kind auswählen</option>{eligibleChildren.map(child => <option value={child.id} key={child.id}>{child.name}</option>)}</select></label><button className="pp-primary">Zur Schließfachauswahl</button><button type="button" className="pp-text" onClick={() => setChoosingChild(false)}>Abbrechen</button></form>}
                        <section className="pp-booking-history"><h2>Ältere Buchungen</h2>{oldBookings.map(booking => <article key={booking.id}><div><strong>Schließfach {booking.locker}</strong><p>{booking.childName} · Schuljahr {booking.year}</p></div><span className="pp-tag">Beendet</span></article>)}</section>
                    </section>}
                </div>}
                {(variant === 'B' || variant === 'C') && <div className="pp-demo-controls"><span>Nur Vorschau · Admin-Freigabe simulieren: </span><button className="pp-text" onClick={() => { setBookingOpen(!bookingOpen); setChoosingChild(false); }}>{bookingOpen ? 'Buchung schließen' : 'Buchung freigeben'}</button></div>}
                <div className="pp-demo-controls"><button className="pp-text" onClick={() => { setChildren(children.length ? [] : examples); setMessage('Beispielzustand geändert; keine echten Daten betroffen.'); }}>{children.length ? 'Leere Familie testen' : 'Beispielkinder laden'}</button></div>
                {message && <p className="pp-notice" role="status">{message}</p>}
                {adding && <section className="pp-add-child" aria-labelledby="pp-add-title"><h2 id="pp-add-title">{editingChild !== null ? 'Vorschau-Kind bearbeiten' : 'Vorschau-Kind hinzufügen'}</h2><form onSubmit={addChild}><label>Name<input required value={childName} onChange={event => setChildName(event.target.value)} placeholder="Nur einen erfundenen Namen verwenden" /></label><label>Klasse<select value={childClass} onChange={event => setChildClass(event.target.value)}><option>5A</option><option>7N</option><option>8N</option></select></label><div><button className="pp-primary" disabled={!childName.trim()}>{editingChild !== null ? 'Änderungen übernehmen' : 'Zur Vorschau hinzufügen'}</button><button type="button" className="pp-text" onClick={() => setAdding(false)}>Abbrechen</button></div></form></section>}
            </main>
        </>}
        {process.env.NODE_ENV !== 'production' && <aside className="pp-switcher" aria-label="Designvarianten"><button aria-label="Vorherige Variante" onClick={() => cycle(-1)}>←</button><div><strong>{variant} · {names[variant]}</strong><small>{dashboard ? `${children.length} Beispielkinder · ${variant !== 'A' ? 'separate Buchungen' : `Jahr ${year}`} · nur im Speicher` : 'Login / Registrierung · keine Authentifizierung'}</small></div><button aria-label="Nächste Variante" onClick={() => cycle(1)}>→</button></aside>}
    </div>;
}
