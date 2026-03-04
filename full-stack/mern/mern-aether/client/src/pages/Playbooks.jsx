import FlowPanel from '../components/FlowPanel'
import FlowPlaybookTable from '../components/panels/FlowPlaybookTable'
import StatsStrip from '../components/panels/StatsStrip'
import { useCollaboration } from '../context/CollaborationContext'

const Playbooks = () => {
  const { broadcastSimulation, stopRemoteSimulation } = useCollaboration()

  const handleRunFlow = (payload) => {
    broadcastSimulation(payload)
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-white/50">Playbooks</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Simulation Library</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Explore curated flows and resilience triggers. Launch them solo or shareable in Live Flow mode to narrate architecture reviews.
        </p>
      </header>
      <StatsStrip />
      <FlowPlaybookTable />
      <FlowPanel onRunFlow={handleRunFlow} onStopFlow={stopRemoteSimulation} />
    </div>
  )
}

export default Playbooks
