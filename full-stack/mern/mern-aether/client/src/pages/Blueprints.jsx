import ServiceDirectory from '../components/panels/ServiceDirectory'
import SchemaPanel from '../components/panels/SchemaPanel'
import StatsStrip from '../components/panels/StatsStrip'

const Blueprints = () => {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-white/50">Blueprints</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Operational Atlas</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Inspect every service node, review tier health, and export infrastructure templates directly from the active diagram snapshot.
        </p>
      </header>
      <StatsStrip />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ServiceDirectory />
        <SchemaPanel />
      </div>
    </div>
  )
}

export default Blueprints
