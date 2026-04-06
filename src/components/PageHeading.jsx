export default function PageHeading({ title }){
    return(
        <div className="pr-4 mb-4">
            <div className="w-full border-b border-[#DE89894D] p-4 bg-white text-3xl font-semibold text-[#27272E] h-20 flex items-center">{title}</div>
        </div>
    )
}