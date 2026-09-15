'use client';

/**
 * ShowcaseGrid.tsx
 *
 * A 4-card showcase grid. Each card shows an animated SVG "product thumbnail"
 * by default and reveals a looping animated "video preview" on hover/focus,
 * implemented entirely with CSS/SVG animations (no video files required).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShowcaseCard {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  ThumbnailIdle: React.FC;
  ThumbnailActive: React.FC;
}

// ─── Thumbnail SVG Illustrations ─────────────────────────────────────────────

function ConversationThumbnail() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Chat bubbles */}
      <rect x="20" y="20" width="160" height="36" rx="8" className="fill-brand-accent/15 stroke-brand-accent/40" strokeWidth="1" />
      <text x="34" y="43" fontSize="10" className="fill-brand-accent font-medium" fontFamily="system-ui">Can we add dark mode?</text>
      <rect x="60" y="70" width="180" height="36" rx="8" className="fill-card dark:fill-slate-900/90 stroke-primary/40" strokeWidth="1" />
      <text x="74" y="93" fontSize="10" className="fill-foreground/90 font-medium" fontFamily="system-ui">Sure, that's a small change…</text>
      <rect x="20" y="120" width="140" height="36" rx="8" className="fill-brand-accent/15 stroke-brand-accent/40" strokeWidth="1" />
      <text x="34" y="143" fontSize="10" className="fill-brand-accent font-medium" fontFamily="system-ui">Also the nav and footer?</text>
      {/* Scope creep indicator */}
      <circle cx="250" cy="40" r="16" className="fill-danger/15 stroke-danger/60" strokeWidth="1.5" />
      <text x="244" y="46" fontSize="11" className="fill-danger font-bold" fontFamily="system-ui">!</text>
    </svg>
  );
}

function ConversationThumbnailActive() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="20" y="20" width="160" height="36" rx="8" className="fill-brand-accent/20 stroke-brand-accent/70" strokeWidth="1">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
      </rect>
      <text x="34" y="43" fontSize="10" className="fill-brand-accent font-medium" fontFamily="system-ui">Can we add dark mode?</text>
      <rect x="60" y="70" width="180" height="36" rx="8" className="fill-card dark:fill-slate-900/90 stroke-primary/70" strokeWidth="1">
        <animate attributeName="opacity" values="1;0.7;1" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
      </rect>
      <text x="74" y="93" fontSize="10" className="fill-foreground font-medium" fontFamily="system-ui">Sure, that's a small change…</text>
      <rect x="20" y="120" width="140" height="36" rx="8" className="fill-brand-accent/20 stroke-brand-accent/70" strokeWidth="1">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" begin="1.2s" />
      </rect>
      <text x="34" y="143" fontSize="10" className="fill-brand-accent font-medium" fontFamily="system-ui">Also the nav and footer?</text>
      {/* Animated detection badge */}
      <circle cx="250" cy="40" r="16" className="fill-danger/25 stroke-danger" strokeWidth="1.5">
        <animate attributeName="r" values="14;18;14" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <text x="244" y="46" fontSize="11" className="fill-danger font-bold" fontFamily="system-ui">!</text>
      {/* Scan line */}
      <rect x="0" y="0" width="280" height="2" className="fill-brand-accent/50">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,180;0,0" dur="2s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

function LedgerThumbnail() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="16" y="16" width="248" height="148" rx="10" className="fill-card dark:fill-slate-900/90 stroke-primary/35" strokeWidth="1" />
      <text x="30" y="42" fontSize="9" className="fill-primary font-semibold" fontFamily="system-ui" letterSpacing="1">SCOPE LEDGER</text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="30" y={60 + i * 24} width="200" height="16" rx="3" className="fill-muted/80 dark:fill-slate-800/60" />
          <rect x="34" y={64 + i * 24} width={80 + i * 18} height="8" rx="2" className="fill-muted-foreground/30" />
          <rect x="198" y={64 + i * 24} width="28" height="8" rx="2" className={i % 2 === 0 ? 'fill-brand-accent/60' : 'fill-primary/60'} />
        </g>
      ))}
      <rect x="30" y="155" width="80" height="7" rx="3" className="fill-success/60" />
      <text x="122" y="162" fontSize="8" className="fill-success font-medium" fontFamily="system-ui">+$690.00</text>
    </svg>
  );
}

function LedgerThumbnailActive() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="16" y="16" width="248" height="148" rx="10" className="fill-card dark:fill-slate-900/95 stroke-primary/70" strokeWidth="1.5">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="30" y="42" fontSize="9" className="fill-primary font-semibold" fontFamily="system-ui" letterSpacing="1">SCOPE LEDGER</text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="30" y={60 + i * 24} width="200" height="16" rx="3" className="fill-muted dark:fill-slate-800/80" />
          <rect x="34" y={64 + i * 24} width={80 + i * 18} height="8" rx="2" className="fill-muted-foreground/50">
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.4 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </rect>
          <rect x="198" y={64 + i * 24} width="28" height="8" rx="2" className={i % 2 === 0 ? 'fill-brand-accent' : 'fill-primary'} />
        </g>
      ))}
      {/* Animated progress fill */}
      <rect x="30" y="155" width="0" height="7" rx="3" className="fill-success">
        <animate attributeName="width" values="0;80;80" dur="1.5s" fill="freeze" />
      </rect>
      <text x="122" y="162" fontSize="8" className="fill-success font-semibold" fontFamily="system-ui">+$690.00</text>
    </svg>
  );
}

function AnalysisThumbnail() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* AI analysis UI */}
      <rect x="16" y="16" width="248" height="148" rx="10" className="fill-card dark:fill-slate-900/90 stroke-brand-accent/30" strokeWidth="1" />
      <text x="30" y="42" fontSize="9" className="fill-brand-accent font-semibold" fontFamily="system-ui" letterSpacing="1">SCOPE ANALYSIS</text>
      {/* Bar chart */}
      {[40, 70, 55, 90, 35, 65].map((h, i) => (
        <rect key={i} x={35 + i * 32} y={140 - h} width="18" height={h} rx="3" className={i % 2 === 0 ? 'fill-brand-accent/50' : 'fill-primary/50'} />
      ))}
      <rect x="30" y="142" width="200" height="1" className="fill-muted-foreground/20" />
      {/* Score */}
      <circle cx="220" cy="60" r="32" className="stroke-brand-accent/40" strokeWidth="2" fill="none" />
      <text x="210" y="66" fontSize="16" className="fill-brand-accent font-bold" fontFamily="system-ui">87</text>
    </svg>
  );
}

function AnalysisThumbnailActive() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="16" y="16" width="248" height="148" rx="10" className="fill-card dark:fill-slate-900/95 stroke-brand-accent/70" strokeWidth="1.5" />
      <text x="30" y="42" fontSize="9" className="fill-brand-accent font-semibold" fontFamily="system-ui" letterSpacing="1">SCOPE ANALYSIS</text>
      {/* Animated bar chart */}
      {[40, 70, 55, 90, 35, 65].map((h, i) => (
        <rect key={i} x={35 + i * 32} y={140 - h} rx="3" className={i % 2 === 0 ? 'fill-brand-accent' : 'fill-primary'} width="18" height="0">
          <animate attributeName="height" values={`0;${h}`} dur="0.8s" fill="freeze" begin={`${i * 0.1}s`} />
          <animate attributeName="y" values={`140;${140 - h}`} dur="0.8s" fill="freeze" begin={`${i * 0.1}s`} />
        </rect>
      ))}
      <rect x="30" y="142" width="200" height="1" className="fill-muted-foreground/30" />
      {/* Animated score circle */}
      <circle cx="220" cy="60" r="32" className="stroke-brand-accent" strokeWidth="2" strokeDasharray="201" strokeDashoffset="50" fill="none">
        <animate attributeName="stroke-dashoffset" values="201;50" dur="1.5s" fill="freeze" />
      </circle>
      <text x="210" y="66" fontSize="16" className="fill-brand-accent font-bold" fontFamily="system-ui">87</text>
    </svg>
  );
}

function ChangeOrderThumbnail() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="16" width="200" height="148" rx="8" className="fill-card dark:fill-slate-900/90 stroke-success/35" strokeWidth="1" />
      <text x="54" y="42" fontSize="9" className="fill-success font-semibold" fontFamily="system-ui" letterSpacing="1">CHANGE ORDER</text>
      <rect x="54" y="52" width="100" height="1.5" className="fill-border" />
      {['Additional Features', 'Revised UI Scope', 'Backend Changes'].map((label, i) => (
        <g key={i}>
          <text x="54" y={76 + i * 26} fontSize="8" className="fill-muted-foreground font-medium" fontFamily="system-ui">{label}</text>
          <text x="190" y={76 + i * 26} fontSize="8" className="fill-brand-accent font-medium" fontFamily="system-ui" textAnchor="end">+{(i + 1) * 2}.5h</text>
        </g>
      ))}
      <rect x="54" y="150" width="172" height="1" className="fill-border" />
      <text x="54" y="165" fontSize="9" className="fill-success font-semibold" fontFamily="system-ui">Total: $690</text>
      <rect x="170" y="155" width="58" height="18" rx="4" className="fill-success/20 stroke-success/60" strokeWidth="1" />
      <text x="183" y="167" fontSize="8" className="fill-success font-medium" fontFamily="system-ui">Send →</text>
    </svg>
  );
}

function ChangeOrderThumbnailActive() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="16" width="200" height="148" rx="8" className="fill-card dark:fill-slate-900/95 stroke-success/80" strokeWidth="1.5" />
      <text x="54" y="42" fontSize="9" className="fill-success font-semibold" fontFamily="system-ui" letterSpacing="1">CHANGE ORDER</text>
      <rect x="54" y="52" width="100" height="1.5" className="fill-border" />
      {['Additional Features', 'Revised UI Scope', 'Backend Changes'].map((label, i) => (
        <g key={i}>
          <text x="54" y={76 + i * 26} fontSize="8" className="fill-foreground font-medium" fontFamily="system-ui">{label}</text>
          <text x="190" y={76 + i * 26} fontSize="8" className="fill-brand-accent font-medium" fontFamily="system-ui" textAnchor="end">
            +{(i + 1) * 2}.5h
            <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" begin={`${0.3 + i * 0.2}s`} />
          </text>
        </g>
      ))}
      <rect x="54" y="150" width="172" height="1" className="fill-border" />
      <text x="54" y="165" fontSize="9" className="fill-success font-semibold" fontFamily="system-ui">Total: $690</text>
      <rect x="170" y="155" width="58" height="18" rx="4" className="fill-success/35 stroke-success" strokeWidth="1">
        <animate attributeName="fill-opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="183" y="167" fontSize="8" className="fill-success font-medium" fontFamily="system-ui">Send →</text>
    </svg>
  );
}

// ─── Card Data ────────────────────────────────────────────────────────────────

const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    id: 'conversations',
    title: 'Conversation Analysis',
    subtitle: 'Detect scope requests in real client threads',
    accentColor: '#22d3ee',
    ThumbnailIdle: ConversationThumbnail,
    ThumbnailActive: ConversationThumbnailActive,
  },
  {
    id: 'ledger',
    title: 'Live Ledger',
    subtitle: 'Every item source-linked with evidence',
    accentColor: '#a78bfa',
    ThumbnailIdle: LedgerThumbnail,
    ThumbnailActive: LedgerThumbnailActive,
  },
  {
    id: 'analysis',
    title: 'AI Scope Scoring',
    subtitle: 'Deterministic impact and hour calculations',
    accentColor: '#22d3ee',
    ThumbnailIdle: AnalysisThumbnail,
    ThumbnailActive: AnalysisThumbnailActive,
  },
  {
    id: 'changeorder',
    title: 'Change Orders',
    subtitle: 'From evidence to billable document in one click',
    accentColor: '#10b981',
    ThumbnailIdle: ChangeOrderThumbnail,
    ThumbnailActive: ChangeOrderThumbnailActive,
  },
];

// ─── Single card ──────────────────────────────────────────────────────────────

function ShowcaseCard({ card }: { card: ShowcaseCard }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="showcase-card group relative cursor-default overflow-hidden rounded-2xl border border-border/80 bg-card/85 text-card-foreground shadow-card backdrop-blur-md transition-all duration-300 hover:border-brand-accent/40 hover:shadow-card-hover"
      style={{
        boxShadow: hovered
          ? `0 0 0 1px ${card.accentColor}40, 0 8px 32px -8px ${card.accentColor}25`
          : undefined,
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="img"
      aria-label={card.title}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-muted/50 dark:bg-slate-950/95 border-b border-border/50">
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <card.ThumbnailActive />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <card.ThumbnailIdle />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover indicator badge */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `${card.accentColor}20`,
                border: `1px solid ${card.accentColor}50`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: card.accentColor, boxShadow: `0 0 6px ${card.accentColor}` }}
              />
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: card.accentColor }}>
                Live
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card footer */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{card.subtitle}</p>
      </div>
    </motion.div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function ShowcaseGrid() {
  return (
    <section id="showcase" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-14 text-center"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-accent">
          Product in motion
        </p>
        <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Every feature, built around your evidence.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">
          Hover any card to see it alive. Each module works together to turn messy client threads into clean billing.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {SHOWCASE_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
            }}
          >
            <ShowcaseCard card={card} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
