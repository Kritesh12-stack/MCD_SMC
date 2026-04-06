import Search from "../assets/Search.svg"

export default function SearchBar({search,setSearch}){
    return(
        <div className="w-112.5 rounded-full bg-[#FAFAFA] flex items-center px-4 py-1 border border-[#E8E8E8]">
            <input className="outline-0 flex-1" value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="Search" />
            <img className="w-4 h-4 cursor-pointer" src={Search} alt="search" />
        </div>
    )
}