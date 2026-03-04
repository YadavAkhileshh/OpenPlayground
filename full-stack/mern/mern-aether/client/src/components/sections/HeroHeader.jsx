import { Rocket, Sparkles } from 'lucide-react'

const HeroHeader = () => (
  <header className="mb-10 text-center md:text-left">
    <p className="text-xs uppercase tracking-[0.5em] text-white/50">Full-stack hero playground</p>
    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-4xl font-semibold md:text-5xl leading-tight">
          Aether · Collaborative System Architect
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-white/70">
          Infinite canvas for mapping distributed systems, replaying live data paths, and exporting infra-ready blueprints.
          Now extended with playbooks and blueprint insights.
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="neon-pill flex items-center gap-2">
          <Sparkles size={14} /> Live Flow mode
        </span>
        <span className="neon-pill flex items-center gap-2 text-emerald-200">
          <Rocket size={14} /> Export ready
        </span>
      </div>
    </div>
  </header>
)

export default HeroHeader
