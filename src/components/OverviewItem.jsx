import TotalTicket from "../assets/TotalTicket.svg"
export default function OverviewItem({ title = "Title" , value = 0 , Icon , bgColor = "#FF5858" }){
    return(
        <div className="surface-panel w-[214px] p-4 flex items-center gap-4">
            <div
                style={{ backgroundColor: bgColor }}
                className="w-11 h-11 flex justify-center items-center rounded-lg shadow-sm">
                <img className="w-5.5 h-5.5" src={Icon || TotalTicket} alt="Icon"/>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
                <div className="font-medium text-[12px] leading-4 text-[#6F7785]">{title}</div>
                <div className="font-semibold text-[24px] leading-7 tracking-[-0.02em] text-[#202124]">{value}</div>
            </div>
        </div>
    )
}
