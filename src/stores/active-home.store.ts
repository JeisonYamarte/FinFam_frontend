import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActiveHomeRole = 'ADMIN' | 'GUEST'

type ActiveHomeState = {
  activeHomeId: string | null
  activeHomeName: string | null
  activeUserRole: ActiveHomeRole | null
  setActiveHome: (id: string, name: string, role: ActiveHomeRole) => void
  clearActiveHome: () => void
}

const initialState = {
  activeHomeId: null,
  activeHomeName: null,
  activeUserRole: null,
} satisfies Pick<
  ActiveHomeState,
  'activeHomeId' | 'activeHomeName' | 'activeUserRole'
>

export const useActiveHomeStore = create<ActiveHomeState>()(
  persist(
    (set) => ({
      ...initialState,
      setActiveHome: (id, name, role) => {
        set({
          activeHomeId: id,
          activeHomeName: name,
          activeUserRole: role,
        })
      },
      clearActiveHome: () => {
        set(initialState)
      },
    }),
    {
      name: 'finfam-active-home',
      partialize: ({ activeHomeId, activeHomeName, activeUserRole }) => ({
        activeHomeId,
        activeHomeName,
        activeUserRole,
      }),
    },
  ),
)

export const activeHomeSelectors = {
  id: (state: ActiveHomeState) => state.activeHomeId,
  name: (state: ActiveHomeState) => state.activeHomeName,
  role: (state: ActiveHomeState) => state.activeUserRole,
}