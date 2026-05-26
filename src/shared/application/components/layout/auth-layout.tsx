import { Outlet } from '@tanstack/react-router'

export const AuthLayout = () => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0f2a36_0%,#080d17_45%,#050913_100%)] px-4 py-6 sm:px-6 sm:py-10">
    <div className="mx-auto flex min-h-[92vh] w-full max-w-6xl items-center justify-center">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  </main>
)
