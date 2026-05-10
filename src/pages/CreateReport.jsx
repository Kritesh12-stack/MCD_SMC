import PageHeading from "../components/PageHeading";
import ScoreMarker from "../components/ScoreMarker";
import DownIcon from "../assets/DownIcon.svg"
import { useState } from "react";
import ScoreCard from "../components/ScoreCard";
import CustomButton from "../components/CustomButton";

export default function CreateReport() {
    const [selectedSection, setSelectedSection] = useState("Outside");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const Parameter = ({ scale, percentage, remark, bgColor, color }) => {
        return (
            <div className="flex flex-col gap-4 justify-center items-center">
                <div className="text-center flex items-center h-10">{remark}</div>
                <div
                    className="w-[80px] h-[35px] rounded-md border px-6 py-2 flex justify-center items-center"
                    style={{ backgroundColor: bgColor, color }}
                >
                    {scale}
                </div>
                <div>{percentage}%</div>
            </div>
        )
    }



    const paramData = [
        {
            scale: "1",
            percentage: "0",
            remark: "NOT McD Quality",
            bgColor: "#EA3323",
            color: "#FFF"
        },
        {
            scale: "2",
            percentage: "25",
            remark: "Significant Difference",
            bgColor: "#EA3323",
            color: "#FFF"
        },
        {
            scale: "3",
            percentage: "60",
            remark: "Marginal",
            bgColor: "#FFFF54",
            color: "#000000"
        },
        {
            scale: "4",
            percentage: "85",
            remark: "Slight Difference",
            bgColor: "#FFFF54",
            color: "#000000"
        },
        {
            scale: "5",
            percentage: "100",
            remark: "Equal to TARGET",
            bgColor: "#52976A",
            color: "#000000"
        }, {
            scale: "4",
            percentage: "85",
            remark: "Slight Difference",
            bgColor: "#FFFF54",
            color: "#000000"
        }, {
            scale: "3",
            percentage: "60",
            remark: "Marginal",
            bgColor: "#FFFF54",
            color: "#000000"
        }, {
            scale: "2",
            percentage: "25",
            remark: "Significant Difference",
            bgColor: "#EA3323",
            color: "#FFF"
        },
        {
            scale: "1",
            percentage: "0",
            remark: "NOT McD Quality",
            bgColor: "#EA3323",
            color: "#FFF"
        },



    ]

    const questions = {
        "Outside": {
            list: [
                {
                    question: "Color Uniformity",
                    subtitle: "Consistent color throughout the product"
                },
                {
                    question: "Shape & Size",
                    subtitle: "Product should be within specified limits"
                },
                {
                    question: "Texture",
                    subtitle: "Product should be within specified limits"
                }
            ],
            subTitle: "Visual assessment of color, size, shape, and overall presentation"
        }
        ,
        "Inside": {
            list: [
                {
                    question: "Moisture Content",
                    subtitle: "Product should be within specified limits"
                },
                {
                    question: "Flavor",
                    subtitle: "Product should be within specified limits"
                },
                {
                    question: "Temperature",
                    subtitle: "Product should be within specified limits"
                }
            ],
            subTitle: "All attributes are to be evaluated at room temperature"
        }
    }
    const sectionKeys = Object.keys(questions);

    return (
        <div>
            <PageHeading
                title={"Create a Report"}
            />
            <div className="text-[14px] text-[#494949] leading-6 flex flex-col gap-4 p-4">
                <div className="flex items-center">
                    <div className="w-[125px]">Instruction :</div>
                    <div>Please evaluate the sample. For each attribute, indicate whether it exhibits more than, less than, or equalto the target.</div>
                </div>
                <div className="flex items-center">
                    <div className="w-[125px]">Sensory Score :</div>
                    <div className="flex-1 flex items-center justify-between">
                        {paramData.map((data, index) => (
                            <Parameter
                                key={index}
                                scale={data.scale}
                                percentage={data.percentage}
                                remark={data.remark}
                                bgColor={data.bgColor}
                                color={data.color}
                            />
                        ))}
                    </div>
                </div>
                <div className="w-full flex items-center">
                    <div className="w-[65%]">APPEARANCE :</div>
                    <div>Fully baked soft rollthat has a uniform deep medium brown color with a sight sheen (same target crown color as BB Big Mac). Bun is uniformly round and symmetricalwith straight wallheels. Crowns are uniformly covered with white opaque sesame seeds of uniform size and black poppy seeds of uniform size. Heel is 19 mm in thickness, the internaltexture is an open, slightly irregular grain and uniformly smooth across the surface. The integrity of toasted bun is maintained after toasting.
                        Internalappearance of both crown and heel are caramelzed to a medium brown color with the heel having the potentialto bea darker toast than the crown. Minimaldefects such as dents, wrinkles, crow feet are acceptable before and after toasting.</div>
                </div>
            </div>
            <div className="p-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 rounded-full border-[#FF5858]"></div>
                        <div className="absolute inset-1 border-2 rounded-full border-[#FF5858]"></div>
                        <div className="absolute inset-2 border-2 rounded-full border-[#FF5858]"></div>
                        <div className="absolute inset-3 border-2 rounded-full border-[#FF5858]"></div>
                    </div>
                    <div className="font-semibold text-lg">Sensory Section Analysis</div>
                </div>
            </div>
            <div className="relative p-4">
                <div
                    className="flex gap-4 items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                    <img
                        src={DownIcon}
                        alt="toggle section"
                        className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                    <div className="flex flex-col">
                        <div className="text-lg font-semibold">{selectedSection}</div>
                        <div className="text-sm font-normal">{questions[selectedSection].subTitle}</div>
                    </div>
                </div>
                <div className={`${isDropdownOpen ? "block" : "hidden"} absolute left-4 top-full z-10 mt-2 min-w-[420px] bg-white border border-[#D1D5DC] rounded-md shadow-md`}>
                    {sectionKeys.map((section) => (
                        <div
                            key={section}
                            className="px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer border-b border-[#E5E7EB] last:border-b-0"
                            onClick={() => {
                                setSelectedSection(section);
                                setIsDropdownOpen(false);
                            }}
                        >
                            <div className="text-base font-semibold">{section}</div>
                            <div className="text-sm text-[#6C757D]">{questions[section].subTitle}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col pb-4 mt-4 p-4">
                <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                        <div className="absolute inset-0 border-2 rounded-full"></div>
                        <div className="absolute inset-1 border-2 rounded-full"></div>
                        <div className="absolute inset-2 border-2 rounded-full"></div>
                    </div>
                    <div className="font-semibold text-base">Sensory Attributes</div>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-4">
            {questions[selectedSection].list.map((q, index) => <ScoreMarker key={index} question={q.question} subtitle={q.subtitle} />)}
            </div>
            </div>
            <div className="p-4">
            <div className="flex justify-between items-center">
                <div className="font-bold text-2xl text-[#494949]">Select the score to fill in the scorecard </div>
                <CustomButton title="Add another sample" rounded={true} type="filled" length="large" />
            </div>
            <div className="flex-1 flex justify-end py-4 gap-6 items-center">
                <div className="font-bold text-[#494949]">SAMPLE CODES :</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{"CC-13-06-2025"}</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{"CC-13-06-2025"}</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{"CC-13-06-2025"}</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{"CC-13-06-2025"}</div>
            </div>
            <div className=" flex flex-col gap-4">
            <ScoreCard/>
            <ScoreCard/>
            <ScoreCard/>
            <ScoreCard/>
            <ScoreCard/>
            </div>
            </div>
            


        </div>
    )
}