export default function MockWatermark({ children }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <span className="text-[8rem] font-black uppercase tracking-[0.4em] text-[#F11518] opacity-10 select-none transform -rotate-12">
          Mock
        </span>
      </div>
      <div className="relative z-0">
        {children}
      </div>
    </div>
  )
}
