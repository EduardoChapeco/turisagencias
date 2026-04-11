import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
  orgName?: string | null;
  orgLogo?: string | null;
  orgPrimaryColor?: string | null;
  orgWhatsapp?: string | null;
  orgEmail?: string | null;
}

export function PublicLayout({
  children,
  orgName = 'CloudBlock Agency',
  orgLogo,
  orgPrimaryColor,
  orgWhatsapp,
  orgEmail
}: PublicLayoutProps) {
  const primaryBg = orgPrimaryColor || '#1E3A5F';

  return (
    <div className="min-h-screen bg-cb-bg text-cb-text font-sans flex flex-col">
      {/* App Header */}
      <header 
        className="h-16 w-full flex items-center justify-center shadow-md relative z-20 shrink-0"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="w-full max-w-6xl px-4 mx-auto flex items-center justify-center gap-3">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName || 'Logo'} className="h-8 object-contain drop-shadow" />
          ) : null}
          <h1 className="font-heading font-semibold text-white tracking-wide text-lg">
            {orgName}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-cb-s1 border-t border-cb-border mt-12 py-8 shrink-0">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cb-muted">
          <div className="flex items-center gap-2">
            {orgLogo && <img src={orgLogo} alt={orgName || 'Logo'} className="h-6 grayscale opacity-60" />}
            <span className="font-medium">{orgName}</span>
          </div>
          <div className="flex items-center gap-6">
            {orgWhatsapp && (
              <a href={`https://wa.me/55${orgWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cb-text transition-colors">
                <Phone className="h-4 w-4" /> {orgWhatsapp}
              </a>
            )}
            {orgEmail && (
              <a href={`mailto:${orgEmail}`} className="flex items-center gap-1.5 hover:text-cb-text transition-colors">
                <Mail className="h-4 w-4" /> {orgEmail}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
