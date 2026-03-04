import { memo } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Activity, Cpu, Database, Shield, Zap, Monitor } from 'lucide-react'

const iconMap = {
  client: Monitor,
  gateway: Shield,
  auth: Activity,
  database: Database,
  cache: Zap,
  analytics: Cpu,
}

const statusTone = {
  stable: 'text-emerald-300',
  degraded: 'text-amber-300',
  paused: 'text-rose-300',
}

const ServiceNode = ({ data }) => {
  const Icon = iconMap[data.preset] || Cpu

  return (
    <motion.article
      initial={{ opacity: 0.6, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'rounded-3xl border border-white/5 bg-slate-950/80 backdrop-blur-xl text-white shadow-xl shadow-cyan-500/10 w-64',
      )}
    >
      <div className={clsx('rounded-3xl rounded-b-none p-4 text-sm font-semibold tracking-wide text-white', `bg-gradient-to-r ${data.accent}`)}>
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span>{data.name}</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mt-1">{data.tier}</p>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>{data.meta}</span>
          <span className={clsx('font-semibold', statusTone[data.status] || 'text-slate-200')}>{data.status}</span>
        </div>

        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between text-cyan-200/80">
            <span>latency</span>
            <span>{data.diagnostics?.latency}</span>
          </div>
          <div className="flex items-center justify-between text-amber-200/80">
            <span>health</span>
            <span>{Math.round((data.diagnostics?.health || 0) * 100)}%</span>
          </div>
          <div className="flex items-center justify-between text-rose-200/80">
            <span>throughput</span>
            <span>{data.diagnostics?.traffic}</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500"
            style={{ width: `${Math.min(100, (data.diagnostics?.health || 0) * 100)}%` }}
            layout
          />
        </div>

        {data.connections?.length ? (
          <div className="text-[10px] text-white/40 uppercase tracking-[0.25em] pt-2 border-t border-white/5">
            {data.connections.length} links
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}

export default memo(ServiceNode)
