import { client } from '@/shared/infrastructure/http/client'

type MessageResponse = {
  message: string
}

export const acceptInvitation = async (invitationId: string): Promise<string> => {
  const { data } = await client.post<MessageResponse>(`/invitations/${invitationId}/accept`)
  return data.message
}

export const declineInvitation = async (invitationId: string): Promise<string> => {
  const { data } = await client.post<MessageResponse>(`/invitations/${invitationId}/decline`)
  return data.message
}
