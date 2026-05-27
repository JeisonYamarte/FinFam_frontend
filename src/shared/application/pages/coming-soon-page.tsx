import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type ComingSoonPageProps = {
  title: string
  description: string
}

export const ComingSoonPage = ({ title, description }: ComingSoonPageProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="rounded-2xl border border-dashed border-border bg-background/40 px-5 py-8 text-sm text-muted-foreground">
        Esta seccion ya tiene ruta y navegacion lista dentro del nuevo app shell. El flujo funcional se conectara sobre la feature `homes` en el siguiente slice.
      </div>
    </CardContent>
  </Card>
)