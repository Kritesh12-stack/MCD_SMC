export default function SidebarItem({ title, icon, Icon, isSelected = false , setSelected }) {
    const iconClass = isSelected ? 'w-5 h-5 text-[#0075FF]' : 'w-5 h-5 text-gray-500'
    const iconSource = Icon || icon

    const IconContent = () => {
        if (!iconSource) return null

        if (typeof iconSource === 'string') {
            return (
                <img
                    src={iconSource}
                    alt="Icon"
                    className="w-5 h-5"
                    style={isSelected ? { filter: 'invert(26%) sepia(86%) saturate(2989%) hue-rotate(199deg) brightness(95%) contrast(95%)' } : undefined}
                />
            )
        }

        const RenderedIcon = iconSource
        return <RenderedIcon className={iconClass} aria-hidden="true" />
    }

    return (
        <div onClick={()=>setSelected(title)} className="w-full cursor-pointer transition-all duration-75 flex items-center gap-2 px-6 py-4 hover:bg-gray-200">
            <IconContent />
            <div className={`flex-1 text-[12px] font-semibold ${isSelected ? "text-[#0075FF]" : "text-[#425466]"}`}>{title}</div>
        </div>
    )
}