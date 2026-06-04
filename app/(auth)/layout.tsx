export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
