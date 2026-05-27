import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { TurisBadge } from '@/components/ui/TurisBadge';
import { Loader2, Globe2 } from 'lucide-react';

const NAV_SECTIONS = [
 { id: 'g-about', emoji: 'ℹ️', label: 'Sobre' },
 { id: 'g-beaches', emoji: '🏖️', label: 'Praias' },
 { id: 'g-route', emoji: '🗺️', label: 'Roteiro' },
 { id: 'g-food', emoji: '🍜', label: 'Gastronomia' },
 { id: 'g-act', emoji: '🎯', label: 'Atividades' },
 { id: 'g-gallery', emoji: '📷', label: 'Galeria' },
 { id: 'g-tips', emoji: '💡', label: 'Dicas' },
 { id: 'g-map', emoji: '🗾', label: 'Mapa' },
];

function hasContent(val: any) {
 if (!val) return false;
 if (Array.isArray(val)) return val.length > 0;
 if (typeof val === 'object') return Object.keys(val).length > 0;
 return String(val).trim().length > 0;
}

export default function PublicGuide() {
 const { slug } = useParams<{ slug: string }>();
 const [activeNav, setActiveNav] = useState<string>('g-about');

 const { data: guide, isLoading, error } = useQuery({
 queryKey: ['public-guide', slug],
 queryFn: async () => {
 if (!slug) throw new Error('Slug is required');
 const { data, error } = await supabase
 .from('destination_guides')
 .select('*')
 .eq('is_published', true) as Record<string, any>;
 if (error) throw error;
 const match = (data as Record<string, any>[])?.find((g: any) => g.slug === slug);
 if (!match) throw new Error('Guide not found');
 return match;
 },
 enabled: !!slug,
 });

 // IntersectionObserver for auto-highlight
 const observerRef = useRef<IntersectionObserver | null>(null);

 useEffect(() => {
 if (!guide) return;
 const obs = new IntersectionObserver(
 (entries) => {
 entries.forEach((e) => {
 if (e.isIntersecting) {
 setActiveNav(e.target.id);
 }
 });
 },
 { threshold: 0.2, rootMargin: '-100px 0px -50% 0px' }
 );
 observerRef.current = obs;
 NAV_SECTIONS.forEach(({ id }) => {
 const el = document.getElementById(id);
 if (el) obs.observe(el);
 });
 return () => obs.disconnect();
 }, [guide]);

 const scrollTo = (id: string) => {
 setActiveNav(id);
 const el = document.getElementById(id);
 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
 };

 if (isLoading) {
 return (
 <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--vj-bg)' }}>
 <Loader2 style={{ width: 32, height: 32, color: 'var(--vj-green)', animation: 'spin 1s linear infinite' }} />
 </div>
 );
 }

 if (error || !guide) {
 return (
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--vj-bg)', textAlign: 'center', padding: 24 }}>
 <Globe2 style={{ width: 48, height: 48, color: 'var(--vj-txt3)', marginBottom: 16, opacity: .5 }} />
 <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--vj-txt)' }}>Guia Indisponível</h1>
 <p style={{ color: 'var(--vj-txt2)', marginTop: 8, maxWidth: 380, fontSize: 13 }}>
 Este guia de destino foi removido, está em modo privado ou a URL é inválida. Consulte seu agente de viagens.
 </p>
 </div>
 );
 }

 // Parse JSONB fields
 const attractions: any[] = guide.attractions ?? guide.points_of_interest ?? [];
 const itinerary: any[] = guide.itinerary ?? guide.sample_itinerary ?? [];
 const activities: any[] = guide.activities ?? [];
 const gallery: any[] = guide.gallery ?? guide.photo_gallery ?? [];
 const tips: any[] = guide.tips ?? guide.travel_tips ?? [];
 const facts: Record<string, string> = guide.facts ?? {};
 const usefulNumbers: Record<string, string> = guide.useful_numbers ?? {};
 const healthInfo: string = guide.health_safety ?? '';
 const restaurants: any[] = guide.restaurants ?? guide.gastronomy ?? [];
 const coverUrl: string = guide.cover_image_url ?? '';

 // Which nav sections exist
 const visibleNav = NAV_SECTIONS.filter(({ id }) => {
 if (id === 'g-about') return true;
 if (id === 'g-beaches') return attractions.length > 0;
 if (id === 'g-route') return itinerary.length > 0;
 if (id === 'g-food') return restaurants.length > 0;
 if (id === 'g-act') return activities.length > 0;
 if (id === 'g-gallery') return gallery.length > 0;
 if (id === 'g-tips') return tips.length > 0;
 if (id === 'g-map') return hasContent(guide.map_info) || hasContent(facts);
 return false;
 });

 const GALLERY_EMOJIS = ['🌊', '🛕', '🌅', '🏄', '🐘', '🌺', '🤿', '🌴'];

 return (
 <>
 <PublicLayout
 orgName="Guia do Destino"
 tabs={visibleNav.map(({ id, label, emoji }) => ({
 id,
 label: `${emoji} ${label}`,
 active: activeNav === id,
 onClick: () => scrollTo(id),
 }))}
 >
 {/* ══ GUIDE COVER ══ */}
 <div className="vj-guide-cover">
 {coverUrl ? (
 <img
 src={coverUrl}
 alt={guide.city}
 style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
 />
 ) : (
 <div className="vj-gc-bg">🌴 🏝️ 🌊</div>
 )}
 <div className="vj-cover-overlay" />
 <div className="vj-cover-content">
 <div className="vj-gc-kicker">Guia completo · {guide.country}</div>
 <div className="vj-gc-title">{guide.city}</div>
 <div className="vj-cover-chips">
 {guide.best_season && <div className="vj-cover-chip">🗓️ {guide.best_season}</div>}
 <div className="vj-cover-chip">⏱ Leitura 8 min</div>
 <div className="vj-cover-chip">📍 {guide.country}</div>
 </div>
 </div>
 </div>

 {/* ══ GUIDE NAV BAR ══ */}
 <div className="vj-gnav-bar">
 {visibleNav.map(({ id, label, emoji }) => (
 <button
 key={id}
 className={`vj-gnav-btn${activeNav === id ? ' active' : ''}`}
 onClick={() => scrollTo(id)}
 >
 {emoji} {label}
 </button>
 ))}
 </div>

 {/* ══ CONTEÚDO ══ */}
 <div className="vj-wrap-lg">

 {/* SOBRE — Dest Panel */}
 <div className="vj-g-sec" id="g-about">
 <div className="vj-g-sh">
 <div>
 <h2>ℹ️ Sobre o Destino</h2>
 <div className="vj-g-sh-sub">Informações essenciais para sua viagem</div>
 </div>
 </div>
 <div className="vj-dest-panel">
 {/* Col 1 — Intro */}
 <div className="vj-g-about">
 <div className="vj-g-about-title">{guide.city}, {guide.country}</div>
 <p>{guide.intro || guide.description || `${guide.city} é um destino incrível que oferece experiências únicas para cada tipo de viajante. Prepare-se para uma aventura inesquecível com nossa curadoria especial de atrações e dicas locais.`}</p>
 {guide.climate_info && (
 <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--vj-bg)', border: '1px solid var(--vj-border)', borderRadius: 12, fontSize: 12, color: 'var(--vj-txt2)' }}>
 <strong style={{ display: 'block', marginBottom: 4, color: 'var(--vj-txt)' }}>☀️ Clima</strong>
 {guide.climate_info}
 </div>
 )}
 </div>

 {/* Col 2 — Facts */}
 <div className="vj-g-facts">
 <h4>Dados rápidos</h4>
 {guide.language_tips && (
 <div className="vj-fact-row">
 <span className="vj-fact-key">Idioma</span>
 <span className="vj-fact-val">{guide.language_tips}</span>
 </div>
 )}
 {guide.currency_info && (
 <div className="vj-fact-row">
 <span className="vj-fact-key">Moeda</span>
 <span className="vj-fact-val">{guide.currency_info}</span>
 </div>
 )}
 {guide.best_season && (
 <div className="vj-fact-row">
 <span className="vj-fact-key">Melhor época</span>
 <span className="vj-dic-val-green">{guide.best_season} ✓</span>
 </div>
 )}
 {guide.timezone && (
 <div className="vj-fact-row">
 <span className="vj-fact-key">Fuso horário</span>
 <span className="vj-fact-val">{guide.timezone}</span>
 </div>
 )}
 {guide.visa_info && (
 <div className="vj-fact-row">
 <span className="vj-fact-key">Visto</span>
 <span className="vj-fact-val">{guide.visa_info}</span>
 </div>
 )}
 {guide.transportation && (
 <div className="vj-fact-row">
 <span className="vj-fact-key">Transporte</span>
 <span className="vj-fact-val">{guide.transportation}</span>
 </div>
 )}
 {Object.entries(facts).map(([k, v]) => (
 <div key={k} className="vj-fact-row">
 <span className="vj-fact-key">{k}</span>
 <span className="vj-fact-val">{v as string}</span>
 </div>
 ))}
 </div>

 {/* Col 3 — Side */}
 <div className="vj-g-side">
 <div className="vj-get-there">
 <div className="vj-gt-title">Como chegar</div>
 <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
 <div className="vj-gt-val">{guide.how_to_get_there_duration || '~10h'}</div>
 <div className="vj-gt-plus">de voo</div>
 </div>
 <div className="vj-gt-sub">{guide.how_to_get_there || 'Voo direto ou com conexão. Consulte seu agente para as melhores rotas.'}</div>
 <button className="vj-gt-btn">Ver opções de voo</button>
 </div>

 {/* Alertas importantes */}
 {healthInfo && (
 <div className="vj-note-card vj-note-card-orange">
 <div className="vj-nc-icon">⚠️</div>
 <div className="vj-nc-title vj-nc-title-orange">Saúde & Segurança</div>
 <div className="vj-nc-text vj-nc-text-orange" style={{ whiteSpace: 'pre-wrap' }}>{healthInfo}</div>
 </div>
 )}

 {guide.visa_info && (
 <div className="vj-note-card">
 <div className="vj-nc-icon">✅</div>
 <div className="vj-nc-title">Visto</div>
 <div className="vj-nc-text">{guide.visa_info}</div>
 </div>
 )}

 {/* Números úteis */}
 {Object.keys(usefulNumbers).length > 0 && (
 <div className="vj-info-card">
 <div className="vj-dic-title">📞 Números Úteis</div>
 {Object.entries(usefulNumbers).map(([k, v]) => (
 <div key={k} className="vj-dic-row">
 <span className="vj-dic-key">{k}</span>
 <span className="vj-dic-val">{v as string}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 {/* PRAIAS / ATRAÇÕES */}
 {attractions.length > 0 && (
 <div className="vj-g-sec" id="g-beaches">
 <div className="vj-g-sh">
 <div>
 <h2>🏖️ Atrações & Praias</h2>
 <div className="vj-g-sh-sub">Os pontos imperdíveis de {guide.city}</div>
 </div>
 </div>
 <div className="vj-hscroll">
 {attractions.map((attr: any, i: number) => (
 <div key={i} className={`vj-pc vj-pc-wide`}>
 <div
 className="vj-pc-img"
 style={{
 background: attr.image_url ? undefined :
 `linear-gradient(160deg, ${['#0a3a5c,#1565c0', '#1a3a2a,#2a6a4a', '#3a1a2a,#6a2a4a'][i % 3]})`,
 }}
 >
 {attr.image_url
 ? <img src={attr.image_url} alt={attr.name} />
 : ['🏖️', '🛕', '🏔️', '🌊', '🌿'][i % 5]
 }
 {attr.highlight && <div className="vj-pc-badge vj-pc-badge-green">Imperdível</div>}
 </div>
 <div className="vj-pc-info">
 <div className="vj-pc-cat">{attr.category || 'Atração'}</div>
 <div className="vj-pc-name">{attr.name}</div>
 <div className="vj-pc-row">
 {attr.rating && <span className="vj-pc-rating">★ {attr.rating}</span>}
 <span className="vj-pc-price">{attr.price || 'Ver detalhes'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ROTEIRO */}
 {itinerary.length > 0 && (
 <div className="vj-g-sec" id="g-route">
 <div className="vj-g-sh">
 <div>
 <h2>🗺️ Roteiro Sugerido</h2>
 <div className="vj-g-sh-sub">Dia a dia em {guide.city}</div>
 </div>
 </div>

 {/* Feature card para o dia mais especial */}
 {itinerary[0] && (
 <div className="vj-feature-card">
 <div
 className="vj-fc-img"
 style={{ background: itinerary[0].image_url ? undefined : 'linear-gradient(160deg,#1a3a2a,#2a6a4a)' }}
 >
 {itinerary[0].image_url ? <img src={itinerary[0].image_url} alt={itinerary[0].title} /> : '🗺️'}
 </div>
 <div className="vj-fc-content">
 <div className="vj-fc-kicker">Ponto alto da viagem</div>
 <div className="vj-fc-title">{itinerary[0].title || `Dia 1 — ${guide.city}`}</div>
 <div className="vj-fc-desc">{itinerary[0].description || `Comece explorando os principais pontos de ${guide.city}, conhecendo a cultura local e os sabores autênticos do destino.`}</div>
 <div className="vj-fc-meta">
 {itinerary[0].duration && <span className="vj-fc-pill">⏱ {itinerary[0].duration}</span>}
 {itinerary[0].transport && <span className="vj-fc-pill">🚐 {itinerary[0].transport}</span>}
 {itinerary[0].age_min && <span className="vj-fc-pill">👶 +{itinerary[0].age_min} anos</span>}
 </div>
 {itinerary[0].price && (
 <div className="vj-fc-price">
 {itinerary[0].price} <span className="vj-fc-price-sub">por pessoa</span>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Route timeline */}
 <div className="vj-route-card">
 <div className="vj-rs">
 {itinerary.map((day: any, i: number) => (
 <div key={i} className="vj-rs-item">
 <div className="vj-rs-dot">{i + 1}</div>
 <div className="vj-rs-body">
 <div className="vj-rs-name">{day.title || `Dia ${i + 1}`}</div>
 {day.description && <div className="vj-rs-desc">{day.description}</div>}
 <div className="vj-rs-meta">
 {day.period && <span>🕐 {day.period}</span>}
 {day.location && <span>📍 {day.location}</span>}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* GASTRONOMIA */}
 {restaurants.length > 0 && (
 <div className="vj-g-sec" id="g-food">
 <div className="vj-g-sh">
 <div>
 <h2>🍜 Gastronomia</h2>
 <div className="vj-g-sh-sub">Sabores autênticos de {guide.city}</div>
 </div>
 </div>
 <div className="vj-hscroll">
 {restaurants.map((r: any, i: number) => (
 <div key={i} className="vj-pc">
 <div
 className="vj-pc-img"
 style={{ background: r.image_url ? undefined : `linear-gradient(135deg, ${['#3a2a0a,#6a4a1a', '#2a3a0a,#4a6a1a', '#0a2a3a,#1a4a6a'][i % 3]})` }}
 >
 {r.image_url ? <img src={r.image_url} alt={r.name} /> : ['🍜', '🍣', '🍛', '🥘', '🌮'][i % 5]}
 </div>
 <div className="vj-pc-info">
 <div className="vj-pc-cat">{r.cuisine || 'Restaurante'}</div>
 <div className="vj-pc-name">{r.name}</div>
 <div className="vj-pc-row">
 {r.rating && <span className="vj-pc-rating">★ {r.rating}</span>}
 <span className="vj-pc-price">{r.price_range || '$$'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ATIVIDADES */}
 {activities.length > 0 && (
 <div className="vj-g-sec" id="g-act">
 <div className="vj-g-sh">
 <div>
 <h2>🎯 Atividades</h2>
 <div className="vj-g-sh-sub">Experiências selecionadas</div>
 </div>
 </div>
 <div className="vj-act-grid">
 {activities.map((act: any, i: number) => (
 <div key={i} className="vj-pc">
 <div
 className="vj-pc-img"
 style={{ background: act.image_url ? undefined : `linear-gradient(135deg, ${['#0a2a4a,#1565c0', '#1a3a2a,#2a6a4a', '#3a1a2a,#6a2a4a', '#2a3a1a,#4a6a1a'][i % 4]})` }}
 >
 {act.image_url ? <img src={act.image_url} alt={act.name} /> : ['🤿', '🧗', '🏄', '🎣', '🚵', '🦅'][i % 6]}
 {act.highlight && <div className="vj-pc-badge vj-pc-badge-green">Destaque</div>}
 </div>
 <div className="vj-pc-info">
 <div className="vj-pc-cat">{act.category || 'Aventura'}</div>
 <div className="vj-pc-name">{act.name}</div>
 <div className="vj-pc-row">
 {act.rating && <span className="vj-pc-rating">★ {act.rating}</span>}
 <span className="vj-pc-price">{act.price || 'Consulte'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* GALERIA */}
 {gallery.length > 0 && (
 <div className="vj-g-sec" id="g-gallery">
 <div className="vj-g-sh">
 <div>
 <h2>📷 Galeria</h2>
 <div className="vj-g-sh-sub">Imagens de {guide.city}</div>
 </div>
 </div>
 <div className="vj-gallery-grid">
 {gallery.slice(0, 7).map((img: any, i: number) => (
 <div
 key={i}
 className={`vj-gg-item${i === 0 ? ' vj-gg-tall' : i === 3 ? ' vj-gg-wide' : ''}`}
 style={{ background: img.url ? undefined : `hsl(${100 + i * 30}, 40%, 88%)` }}
 >
 {img.url ? <img src={img.url} alt={img.caption || ''} /> : GALLERY_EMOJIS[i % GALLERY_EMOJIS.length]}
 </div>
 ))}
 {/* Preenche com placeholders se não tiver fotos suficientes */}
 {gallery.length === 0 && GALLERY_EMOJIS.slice(0, 7).map((emoji, i) => (
 <div
 key={i}
 className={`vj-gg-item${i === 0 ? ' vj-gg-tall' : i === 3 ? ' vj-gg-wide' : ''}`}
 style={{ background: `hsl(${100 + i * 30}, 40%, 88%)`, cursor: 'default' }}
 >
 {emoji}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* DICAS */}
 {tips.length > 0 && (
 <div className="vj-g-sec" id="g-tips">
 <div className="vj-g-sh">
 <div>
 <h2>💡 Dicas Essenciais</h2>
 <div className="vj-g-sh-sub">O que saber antes de ir</div>
 </div>
 </div>
 <div className="vj-tip-grid">
 {tips.map((tip: any, i: number) => (
 <div key={i} className="vj-tip-card">
 <div className="vj-tip-icon">{tip.emoji || ['🌿', '💰', '🚕', '🌡️', '📱', '🗣️'][i % 6]}</div>
 <div className="vj-tip-title">{tip.title || tip.tip}</div>
 <div className="vj-tip-text">{tip.text || tip.description || ''}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Seção de texto livre — dicas do guia */}
 {guide.travel_tips && typeof guide.travel_tips === 'string' && (
 <div className="vj-g-sec" id="g-tips" style={{ marginTop: tips.length > 0 ? 0 : undefined }}>
 {tips.length === 0 && (
 <div className="vj-g-sh">
 <div>
 <h2>💡 Dicas de Viagem</h2>
 <div className="vj-g-sh-sub">Curadoria do especialista</div>
 </div>
 </div>
 )}
 <div className="vj-note-card vj-note-card-blue">
 <div className="vj-nc-icon">💡</div>
 <div className="vj-nc-title vj-nc-title-blue">Dicas especiais</div>
 <div className="vj-nc-text vj-nc-text-blue" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
 {guide.travel_tips}
 </div>
 </div>
 </div>
 )}

 {/* MAPA */}
 <div className="vj-g-sec" id="g-map">
 <div className="vj-g-sh">
 <div>
 <h2>🗾 Mapa</h2>
 <div className="vj-g-sh-sub">Localização e pontos de referência</div>
 </div>
 </div>
 <div className="vj-map-big">
 <div className="vj-mb-area">
 <svg viewBox="0 0 800 320" fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
 <rect width="800" height="320" fill="#d8e8d0"/>
 <ellipse cx="400" cy="160" rx="150" ry="90" fill="#b8d8b0" opacity=".5"/>
 <ellipse cx="200" cy="220" rx="80" ry="50" fill="#a8c8a0" opacity=".4"/>
 <path d="M100 60 Q300 40 500 160 Q620 220 780 180" stroke="rgba(255,255,255,.7)" strokeWidth="4" fill="none"/>
 <path d="M200 280 Q350 240 500 260" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
 {attractions.slice(0, 4).map((_: any, i: number) => {
 const cx = [280, 460, 350, 550][i];
 const cy = [130, 170, 220, 120][i];
 const fill = ['#e53935', '#1a5fa8', '#1a7a4a', '#d4511a'][i];
 return (
 <g key={i}>
 <circle cx={cx} cy={cy} r={9} fill={fill} stroke="white" strokeWidth="2.5"/>
 </g>
 );
 })}
 {attractions.length === 0 && (
 <>
 <circle cx="280" cy="130" r="9" fill="#e53935" stroke="white" strokeWidth="2.5"/>
 <circle cx="460" cy="170" r="9" fill="#1a5fa8" stroke="white" strokeWidth="2.5"/>
 <circle cx="350" cy="220" r="9" fill="#1a7a4a" stroke="white" strokeWidth="2.5"/>
 </>
 )}
 </svg>
 </div>
 <div className="vj-mb-sidebar">
 <div className="vj-mb-title">Legenda</div>
 <div className="vj-mb-legend">
 <div className="vj-mb-leg-item">
 <div className="vj-mb-dot" style={{ background: '#e53935' }}/>
 Atrações
 </div>
 <div className="vj-mb-leg-item">
 <div className="vj-mb-dot" style={{ background: '#1a5fa8' }}/>
 Hotéis
 </div>
 <div className="vj-mb-leg-item">
 <div className="vj-mb-dot" style={{ background: '#1a7a4a' }}/>
 Restaurantes
 </div>
 {attractions.length > 0 && (
 <div className="vj-mb-leg-item">
 <div className="vj-mb-dot" style={{ background: '#d4511a' }}/>
 Outros pontos
 </div>
 )}
 </div>
 <div className="vj-mb-distances">
 <div style={{ marginBottom: 4, fontWeight: 600, fontSize: 11 }}>Distâncias úteis</div>
 🛫 Aeroporto → centro <strong style={{ float: 'right' }}>~30 min</strong><br/>
 🏨 Hotel → praias <strong style={{ float: 'right' }}>~15 min</strong><br/>
 🍜 Área gastronômica <strong style={{ float: 'right' }}>~10 min</strong>
 </div>
 </div>
 </div>
 </div>

 {/* CLIMA — só exibe se houver informação real de clima no guia */}
 {guide.climate_info && (
 <div style={{ marginTop: 20 }}>
 <div className="vj-weather-card">
 <div className="vj-wc-main">
 <div className="vj-wc-icon">☀️</div>
 <div>
 <div className="vj-wc-temp">
 {guide.avg_temperature ? `${guide.avg_temperature}°C` : '—'}
 </div>
 <div className="vj-wc-sub">{guide.city} · {guide.best_season || 'Clima local'}</div>
 </div>
 </div>
 <div className="vj-wc-note">
 <p style={{ fontSize: 12, color: 'var(--vj-txt2)', lineHeight: 1.6, margin: 0 }}>
 {guide.climate_info}
 </p>
 </div>
 </div>
 </div>
 )}

 </div>

 {/* Footer */}
 <div className="vj-footer">
 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--vj-green)' }} />
 <span style={{ fontWeight: 600 }}>Guia do Destino — {guide.city}</span>
 </div>
 <span>Powered by Turis Agencias · Turis Agencias</span>
 </div>
 </PublicLayout>
 <TurisBadge />
 </>
 );
}

