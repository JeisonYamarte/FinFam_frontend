import { create } from 'zustand'

import type { HomeMember } from '@/features/homes/domain/Home.entity'

type HomeMembersState = {
  members: HomeMember[]
  isLoading: boolean
  setMembers: (members: HomeMember[]) => void
  setIsLoading: (isLoading: boolean) => void
  clearMembers: () => void
}

export const useHomeMembersStore = create<HomeMembersState>((set) => ({
  members: [],
  isLoading: false,
  setMembers: (members) => {
    set({ members })
  },
  setIsLoading: (isLoading) => {
    set({ isLoading })
  },
  clearMembers: () => {
    set({ members: [], isLoading: false })
  },
}))

export const homeMembersSelectors = {
  members: (state: HomeMembersState) => state.members,
  isLoading: (state: HomeMembersState) => state.isLoading,
}
