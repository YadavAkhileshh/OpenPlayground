import { createContext, useContext } from 'react'
import { useLiveCollaboration } from '../hooks/useLiveCollaboration'

const CollaborationContext = createContext(null)

export const CollaborationProvider = ({ children }) => {
  const value = useLiveCollaboration()
  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>
}

export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider')
  }
  return context
}
