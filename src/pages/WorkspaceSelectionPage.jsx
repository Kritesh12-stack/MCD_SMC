export default function WorkspaceSelectionPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-8 py-4">
        <h1 className="text-white text-2xl font-bold">FOODLAND</h1>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="bg-white rounded-xl shadow-sm p-10 max-w-3xl w-full">
          <h2 className="text-2xl font-semibold text-[#1A1A2E] mb-8">Select your workspace</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Complaint Management System */}
            <a href="/login"
              className="border-2 border-[#F11518] rounded-xl p-6 flex flex-col items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="h-32 flex items-center justify-center mb-6">
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                  <rect x="10" y="20" width="50" height="60" rx="4" fill="#FEE2E2" />
                  <rect x="16" y="30" width="12" height="30" rx="2" fill="#F87171" />
                  <rect x="32" y="40" width="12" height="20" rx="2" fill="#FBBF24" />
                  <rect x="48" y="25" width="12" height="35" rx="2" fill="#34D399" />
                  <circle cx="85" cy="55" r="25" fill="#FEE2E2" />
                  <path d="M85 35 L85 55 L100 55" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85 55 L70 70" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
                  <rect x="60" y="10" width="40" height="25" rx="3" fill="#DBEAFE" />
                  <rect x="65" y="16" width="30" height="3" rx="1" fill="#93C5FD" />
                  <rect x="65" y="22" width="20" height="3" rx="1" fill="#93C5FD" />
                </svg>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-base font-medium text-[#1A1A2E]">Complaint Management System</span>
                <span className="text-[#F11518] text-xl group-hover:translate-x-1 transition-transform">›</span>
              </div>
            </a>

            {/* Score Card */}
            <div
              className="border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center justify-between hover:shadow-md transition-shadow cursor-pointer group opacity-70"
            >
              <div className="h-32 flex items-center justify-center mb-6">
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                  <rect x="25" y="30" width="70" height="55" rx="4" fill="#FEF3C7" />
                  <rect x="35" y="40" width="50" height="6" rx="2" fill="#FCD34D" />
                  <rect x="35" y="52" width="50" height="6" rx="2" fill="#FCD34D" />
                  <rect x="35" y="64" width="30" height="6" rx="2" fill="#FCD34D" />
                  <polygon points="50,5 53,15 63,15 55,21 58,31 50,25 42,31 45,21 37,15 47,15" fill="#FBBF24" />
                  <polygon points="70,5 73,15 83,15 75,21 78,31 70,25 62,31 65,21 57,15 67,15" fill="#FBBF24" />
                  <polygon points="90,5 93,15 103,15 95,21 98,31 90,25 82,31 85,21 77,15 87,15" fill="#FBBF24" />
                </svg>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-base font-medium text-[#1A1A2E]">Score Card</span>
                <span className="text-[#6B7280] text-xl group-hover:translate-x-1 transition-transform">›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
