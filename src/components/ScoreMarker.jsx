import { useState } from 'react'
export default function ScoreMarker({ question, subtitle, score, onScoreChange }) {
    const colours = [
        ["#EA3323", "#FFF", "NOT McD Quality"],
        ["#FFFF54", "#000000", "Significant Difference"],
        ["#52976A", "#000000", "Marginal"],
        ["#52976A", "#000000", "Slight Difference"],
        ["#52976A", "#000000", "Equal to TARGET"],
        ["#52976A", "#000000", "Slight Difference"],
        ["#52976A", "#000000", "Marginal"],
        ["#52976A", "#000000", "Significant Difference"],
        ["#52976A", "#000000", "NOT McD Quality"],
    ]
    const selectedColour = score ? colours[score - 1] : null;

    return (
        <div className="p-5 w-[800px] border-l-4 border-[#FF5858] bg-[#F9FAFB]">
            <div className="flex justify-between items-center">
                <div className="text-[#2C2C2C] text-lg font-medium">{question}</div>
                <div className="flex items-center text-sm text-[#6C757D] gap-2">
                    <div>Score : </div>
                    <div className="flex items-center"><span className="text-[#FF5858] text-2xl">{score}</span> / 9</div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="text-sm text-[#6C757D]">{subtitle}</div>
                <div
                    className="text-xs font-medium px-2 py-1 rounded-md"
                    style={{
                        color: selectedColour ? selectedColour[1] : "#FFC72C",
                        backgroundColor: selectedColour ? selectedColour[0] : "#FFF3CD",
                    }}
                >
                    {selectedColour ? selectedColour[2] : "-"}
                </div>
            </div>
            <div className="flex w-full justify-between py-5">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (<div key={i} onClick={() => onScoreChange(i)} style={{ backgroundColor: i == score ? colours[i-1][0] : "", color: i == score ? colours[i-1][1] : "" }} className="border-2 cursor-pointer border-[#D1D5DC] text-base font-normal w-[60px] h-[60px] rounded-full flex justify-center items-center">{i}</div>))}</div>
        </div>
    )
}