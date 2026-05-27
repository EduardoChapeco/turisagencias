import React from 'react';

export interface PublicTab {
 id: string;
 label: string;
 active?: boolean;
 onClick?: () => void;
}

interface PublicLayoutProps {
 children: React.ReactNode;
 orgName?: string | null;
 orgLogo?: string | null;
 orgPrimaryColor?: string | null;
 orgWhatsapp?: string | null;
 orgEmail?: string | null;
 /** Tabs para a topbar (Cotação, Guia, etc.) */
 tabs?: PublicTab[];
 /** Texto do botão primário de ação (ex: "Reservar") */
 ctaLabel?: string;
 onCtaClick?: () => void;
 /** Texto do botão secundário (ex: "Pergunta") */
 ctaSecondaryLabel?: string;
 onCtaSecondaryClick?: () => void;
}

/**
 * PublicLayout — Shell dos WebViews do cliente
 * Topbar fixa 50px · Viaja Design System PRD §2
 */
export function PublicLayout({
 children,
 orgName = 'Agência de Viagens',
 orgLogo,
 tabs = [],
 ctaLabel,
 onCtaClick,
 ctaSecondaryLabel,
 onCtaSecondaryClick,
}: PublicLayoutProps) {
 return (
 <div className="vj-root">
 {/* ── Topbar ── */}
 <div className="vj-topbar">
 {/* Logo */}
 <div className="vj-logo">
 {orgLogo ? (
 <img src={orgLogo} alt={orgName ?? ''} style={{ height: 24, objectFit: 'contain' }} />
 ) : (
 <>
 <div className="vj-logo-dot" />
 <span>{orgName}</span>
 </>
 )}
 </div>

 {/* Tabs centrais */}
 {tabs.length > 0 && (
 <div className="vj-top-tabs">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 className={`vj-ttab${tab.active ? ' active' : ''}`}
 onClick={tab.onClick}
 >
 {tab.label}
 </button>
 ))}
 </div>
 )}

 {/* Ações */}
 <div className="vj-top-actions">
 {ctaSecondaryLabel && (
 <button className="vj-tbtn" onClick={onCtaSecondaryClick}>
 {ctaSecondaryLabel}
 </button>
 )}
 {ctaLabel && (
 <button className="vj-tbtn vj-tbtn-solid" onClick={onCtaClick}>
 {ctaLabel}
 </button>
 )}
 </div>
 </div>

 {/* ── Page Content ── */}
 <div className="vj-page">
 {children}
 </div>
 </div>
 );
}
