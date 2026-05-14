import Search from "../assets/Search.svg"

export default function SearchBar({search,setSearch}){
    return(
        <div className="control-field w-full max-w-[450px] flex items-center px-3">
            <input className="min-w-0 flex-1 bg-transparent text-[13px] outline-0 placeholder:text-[#9AA3B2]" value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="Search" />
            <img className="w-4 h-4 opacity-60" src={Search} alt="search" />
        </div>
    )
}
