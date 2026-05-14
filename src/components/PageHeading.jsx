export default function PageHeading({ title }){
    return(
        <div className="px-6 pt-5 pb-3">
            <div className="flex h-14 items-center border-b border-[#E6E9EE]">
                <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-[#202124]">{title}</h1>
            </div>
        </div>
    )
}
