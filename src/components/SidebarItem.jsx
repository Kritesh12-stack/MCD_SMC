import { useNavigate } from "react-router-dom"

export default function SidebarItem({ title, icon, Icon, isSelected = false, setSelected, path, badge = 0, onClick }) {
    const iconClass = isSelected ? 'w-5 h-5 text-[#DB2F28]' : 'w-5 h-5 text-[#7B8494]'
    const iconSource = Icon || icon
    const navigate = useNavigate()
    const IconContent = () => {
        if (!iconSource) return null

        if (typeof iconSource === 'string') {
            return (
                <img
                    src={iconSource}
                    alt="Icon"
                    className="w-5 h-5"
                    style={isSelected ? { filter: 'invert(23%) sepia(79%) saturate(2444%) hue-rotate(346deg) brightness(92%) contrast(89%)' } : undefined}
                />
            )
        }

        const RenderedIcon = iconSource
        return <RenderedIcon className={iconClass} aria-hidden="true" />
    }

    function handleClick() {
        if (onClick) { onClick(); return; }
        setSelected(title)
        navigate(path)
    }

    return (
        <div onClick={handleClick} className={`mx-3 mb-1 flex w-[calc(100%-1.5rem)] cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all duration-150 ${isSelected ? "bg-[#FFF4EA] shadow-[inset_3px_0_0_#DB2F28]" : "hover:bg-[#F6F7F9]"}`}>
            <IconContent />
            <div className={`flex-1 text-[12px] font-semibold ${isSelected ? "text-[#202124]" : "text-[#556070]"}`}>{title}</div>
            {badge > 0 && (
                <span className="bg-[#DB2F28] text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                    {badge > 99 ? "99+" : badge}
                </span>
            )}
        </div>
    )
}
