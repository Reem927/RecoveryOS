export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0F1E28] text-white">
      {/* ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-[#C97A56]/15 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-80px] h-[360px] w-[360px] rounded-full bg-[#C97A56]/8 blur-[120px]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
