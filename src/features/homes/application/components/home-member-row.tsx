import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getInitials } from '@/features/homes/application/utils/formatters'
import type { HomeMember } from '@/features/homes/domain/Home.entity'

type HomeMemberRowProps = {
  member: HomeMember
  isAdmin: boolean
  isUpdatingRole?: boolean
  isRemoving?: boolean
  onToggleRole: (member: HomeMember) => void
  onRequestRemove: (member: HomeMember) => void
}

export const HomeMemberRow = ({
  member,
  isAdmin,
  isUpdatingRole = false,
  isRemoving = false,
  onToggleRole,
  onRequestRemove,
}: HomeMemberRowProps) => (
  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-background/45 p-3 sm:flex-nowrap">
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-200/90 text-sm font-semibold text-sky-900">
      {getInitials(member.name)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-foreground sm:text-base">{member.name}</p>
      <p className="truncate text-xs text-muted-foreground sm:text-sm">{member.email || 'Sin correo'}</p>
    </div>
    <span className="order-3 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 ring-1 ring-emerald-300/20 sm:order-0">
      {member.role}
    </span>
    {isAdmin ? (
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" size="icon-sm" variant="ghost" className="order-2 ml-auto sm:order-0 sm:ml-0">
            <EllipsisHorizontalIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 rounded-2xl border-white/10 bg-card/98 p-2">
          <div className="space-y-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              disabled={isUpdatingRole}
              onClick={() => {
                onToggleRole(member)
              }}
            >
              Cambiar a {member.role === 'ADMIN' ? 'GUEST' : 'ADMIN'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              disabled={isRemoving}
              onClick={() => {
                onRequestRemove(member)
              }}
            >
              <TrashIcon className="size-4" />
              Eliminar miembro
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    ) : null}
  </div>
)