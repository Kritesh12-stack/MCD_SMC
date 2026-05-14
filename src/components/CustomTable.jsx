const CustomTable = ({ columns, data, maxRows = null }) => {
  // Calculate max height based on maxRows
  // Approximate: header ~32px, each row ~44px
  const maxHeight = maxRows ? `${32 + maxRows * 44}px` : "auto";

  return (
    <div className="bg-white">
      <style>{`
        .custom-table-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-table-scroll::-webkit-scrollbar-thumb {
          background-color: #d9dee7;
          border-radius: 3px;
        }
        .custom-table-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #aeb7c5;
        }
      `}</style>
      <div 
        className="overflow-x-auto custom-table-scroll" 
        style={{
          maxHeight: maxHeight,
          overflowY: maxRows ? "auto" : "visible",
        }}
      >
        <table className="w-full text-left text-[12px] text-[#344054]">

          {/* Header */}
          <thead className="sticky top-0 bg-[#F8FAFC] text-[11px] uppercase tracking-[0.04em] text-[#667085]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-b-[#EEF1F5] last:border-none hover:bg-[#FBFCFD]"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">

                    {/* Custom Render */}
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key]}

                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default CustomTable;
