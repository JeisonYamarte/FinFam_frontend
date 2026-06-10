import { Outlet } from '@tanstack/react-router'

export const LandingLayout = () => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0f2a36_0%,#080d17_45%,#050913_100%)]">
    <Outlet />
  </main>
)
