import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
  footerText?: string
  footerLinkText?: string
  footerLinkTo?: string
}

export const AuthShell = ({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthShellProps) => (
  <div className="mx-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footerText && footerLinkText && footerLinkTo ? (
        <div className="border-t border-zinc-100 px-6 py-5 text-sm text-zinc-600 sm:px-8">
          {footerText}{' '}
          <Link
            className="font-semibold text-teal-700 transition-colors hover:text-teal-600"
            to={footerLinkTo}
          >
            {footerLinkText}
          </Link>
        </div>
      ) : null}
    </Card>
  </div>
)
