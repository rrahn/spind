import React from 'react';

export function LockerIllustration() {
    return <svg viewBox="0 0 420 380" role="img" aria-label="Frontalansicht einer Schließfachanlage mit sechs gleichmäßig angeordneten Türen">
        <ellipse cx="210" cy="334" rx="145" ry="12" fill="#14364b" opacity=".08" />
        <rect x="88" y="306" width="16" height="22" rx="4" fill="#14364b" />
        <rect x="316" y="306" width="16" height="22" rx="4" fill="#14364b" />
        <rect x="68" y="54" width="284" height="260" rx="14" fill="#286360" />
        <rect x="72" y="58" width="276" height="248" rx="11" fill="#5eaaa4" />
        <path d="M84 62 H336" stroke="#ffffff" strokeWidth="2" opacity=".35" strokeLinecap="round" />
        {[0, 1, 2].map(col => [0, 1].map(row => <g key={`${col}-${row}`} transform={`translate(${82 + col * 88} ${72 + row * 116})`}>
            <rect y="3" width="80" height="104" rx="7" fill="#14364b" opacity=".12" />
            <rect width="80" height="104" rx="7" fill={col === 1 ? '#f6dba7' : '#d0e9df'} />
            <rect x="2" y="2" width="76" height="100" rx="5" fill="none" stroke="#ffffff" opacity=".45" />
            {[0, 1, 2].map(line => <path key={line} d={`M14 ${18 + line * 5} h26`} stroke="#14364b" strokeWidth="2" opacity=".35" strokeLinecap="round" />)}
            <rect x="14" y="48" width="22" height="14" rx="3" fill="#fffefa" opacity=".7" />
            <text x="25" y="58" textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="600" fill="#286360">{String(row * 3 + col + 1).padStart(2, '0')}</text>
            <rect x="61" y="49" width="6" height="20" rx="3" fill="#14364b" />
            <circle cx="64" cy="78" r="3" fill="#14364b" opacity=".45" />
        </g>))}
    </svg>;
}

export function Brand() {
    return <div className="pp-brand"><span aria-hidden="true">s.</span><div>Schulfach<small>Schließfachverwaltung</small></div></div>;
}
