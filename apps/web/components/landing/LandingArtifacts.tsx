import type { ReactNode } from 'react';

export function DepthFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative [perspective:1200px] ${className}`}>{children}</div>;
}

export function ProcessArtifact() {
  return <DepthFrame className="mx-auto h-[300px] w-full max-w-[520px] sm:h-[360px]">
    <div className="absolute left-[8%] top-[13%] h-[68%] w-[66%] rounded-2xl border border-border bg-card/80 p-6 shadow-card backdrop-blur [transform:rotateY(17deg)_rotateX(7deg)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-info">Incoming requests</p>
      <div className="mt-6 space-y-3">{[80, 62, 72].map((width, index) => <div key={width} className="flex items-center gap-3"><span className={`h-7 w-7 rounded-lg ${index === 1 ? 'bg-brand-accent/25' : 'bg-muted'}`} /><span className="h-2 rounded-full bg-muted-foreground/30" style={{ width: `${width}%` }} /></div>)}</div>
    </div>
    <div className="absolute right-[6%] top-[30%] h-[42%] w-[36%] rounded-xl border border-brand-accent/40 bg-accent/70 p-4 shadow-glow [transform:translateZ(70px)_rotateY(-20deg)_rotateX(6deg)]"><p className="font-mono text-[10px] uppercase tracking-wider text-accent-foreground">Scope scan</p><span className="mt-7 block h-2 w-full rounded-full bg-brand-accent/50" /><span className="mt-3 block h-2 w-3/4 rounded-full bg-brand-accent/30" /></div>
    <span className="absolute bottom-[7%] left-[11%] h-16 w-16 rounded-full border border-primary/30 bg-primary/10 blur-[1px] [transform:translateZ(40px)]" />
  </DepthFrame>;
}

export function LedgerArtifact() {
  return <DepthFrame className="mx-auto h-[330px] w-full max-w-[570px] sm:h-[400px]">
    <div className="absolute left-[9%] top-[15%] h-[64%] w-[68%] rounded-2xl border border-border bg-card/75 p-6 shadow-card [transform:rotateY(12deg)_rotateX(5deg)]"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Original scope</p><span className="mt-7 block h-2 w-4/5 rounded-full bg-muted-foreground/30" /><span className="mt-3 block h-2 w-3/5 rounded-full bg-muted-foreground/20" /><span className="mt-10 block h-px w-full bg-border" /><span className="mt-5 block h-2 w-2/3 rounded-full bg-muted-foreground/25" /></div>
    <div className="absolute right-[4%] top-[32%] h-[39%] w-[44%] rounded-xl border border-success/30 bg-card/90 p-5 shadow-card-hover [transform:translateZ(90px)_rotateY(-16deg)_rotateX(6deg)]"><p className="font-mono text-[10px] uppercase tracking-wider text-success">Verified · +8 hrs</p><span className="mt-5 block h-2 w-full rounded-full bg-success/35" /><span className="mt-3 block h-2 w-3/4 rounded-full bg-success/20" /><span className="mt-6 block text-lg font-bold text-success">₹ 12,800</span></div>
    <span className="absolute left-[49%] top-[7%] h-[74%] w-px bg-brand-accent/70 shadow-glow" />
  </DepthFrame>;
}

export function ValueArtifact() {
  return <DepthFrame className="mx-auto h-[290px] w-full max-w-[480px] sm:h-[340px]">
    <div className="absolute left-[17%] top-[18%] h-[58%] w-[63%] rounded-2xl border border-primary/35 bg-primary/20 shadow-card [transform:rotateY(15deg)_rotateX(7deg)]" />
    <div className="absolute left-[23%] top-[13%] h-[58%] w-[63%] rounded-2xl border border-brand-accent/40 bg-card/85 p-7 shadow-glow [transform:translateZ(70px)_rotateY(15deg)_rotateX(7deg)]"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-info">Recovered value</p><p className="mt-6 text-4xl font-bold tracking-tight text-foreground">₹ 36,800</p><div className="mt-6 flex gap-2"><span className="h-2 w-16 rounded-full bg-success/60" /><span className="h-2 w-10 rounded-full bg-success/25" /></div></div>
  </DepthFrame>;
}
