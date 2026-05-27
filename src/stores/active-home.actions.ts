import { queryClient } from '@/lib/query-client'

import {
  useActiveHomeStore,
  type ActiveHomeRole,
} from './active-home.store'

type SetActiveHomeInput = {
  id: string
  name: string
  role: ActiveHomeRole
}

export const setActiveHomeSession = ({ id, name, role }: SetActiveHomeInput): void => {
  useActiveHomeStore.getState().setActiveHome(id, name, role)
  void queryClient.invalidateQueries()
}

export const clearActiveHomeSession = (): void => {
  useActiveHomeStore.getState().clearActiveHome()
  void queryClient.invalidateQueries()
}