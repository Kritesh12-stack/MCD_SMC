export default function Tooltip({ text }) {
    return (
      <div className="relative group inline-block">
        {/* Trigger */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white cursor-pointer">
          i
        </div>
  
        {/* Tooltip */}
        <div
          className="absolute bottom-full right-0 mb-3
                     opacity-0 group-hover:opacity-100
                     transition duration-200
                     pointer-events-none
                     z-50
                     w-56 whitespace-normal break-words
                     rounded-md bg-white px-3 py-2 text-xs text-black shadow-lg border border-gray-200"
        >
          {text}
  
          {/* Arrow */}
          <div className="absolute right-3 top-full border-4 border-transparent border-t-white"></div>
        </div>
      </div>
    );
}
