export default function ScoreCard({ question = "Question" , mainScore = 0, sample1 = 0 , sample2 = 0 , sample3 = 0 }) {
    return (
        <div className="flex items-center gap-4 p-4 text-[#494949] bg-[#FFF5F5] border border-[#0000000D] rounded-md">
            <div className="w-[15%]">{question}</div>
            <div className="w-[35%] flex flex-col gap-2 text-[#000000]">
                <div className="flex justify-between items-center italic text-xs">
                    <div>Light</div>
                    <div>Target</div>
                    <div>Dark</div>
                </div>
                <div className="flex justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <div key={i} className="border border-[#000000] text-sm font-normal w-[30px] h-[30px] rounded-md flex justify-center items-center">{i}</div>)}
                </div>
            </div>
            <div className="flex-1 flex justify-between min-h-[52px] items-end">
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{mainScore}</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{sample1}</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{sample2}</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{sample3}</div>
            </div>
        </div>
    )
}