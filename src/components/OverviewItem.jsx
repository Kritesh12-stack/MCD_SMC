import TotalTicket from "../assets/TotalTicket.svg"
export default function OverviewItem({ title = "Title" , value = 0 , Icon , bgColor = "#FF5858" }){
    return(
        <div className="border border-[#E8E8E8] rounded-[20px] p-4 flex justify-center items-center gap-4">
            <div
                style={{ backgroundColor: bgColor }}
                className={`w-15 h-15 flex justify-center items-center rounded-full`}>
                <img className="w-7.5 h-7.5" src={Icon || TotalTicket} alt="Icon"/>
            </div>
            <div className="flex flex-col gap-4">
                <div className="font-medium text-base text-[#666]">{title}</div>
                <div className="font-bold text-2xl">{value}</div>
            </div>
        </div>
    )
}