const CustomTable = ({ columns, data, maxRows = null }) => {
  // Calculate max height based on maxRows
  // Approximate: header ~32px, each row ~44px
  const maxHeight = maxRows ? `${32 + maxRows * 44}px` : "auto";

  return (
    <div className=" bg-white">
      <style>{`
        .custom-table-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-table-scroll::-webkit-scrollbar-thumb {
          background-color: #FF5858;
          border-radius: 3px;
        }
        .custom-table-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #b91c1c;
        }
      `}</style>
      <div 
        className="overflow-x-auto custom-table-scroll" 
        style={{
          maxHeight: maxHeight,
          overflowY: maxRows ? "auto" : "visible",
        }}
      >
        <table className="w-full text-[10px] text-left text-gray-700">

          {/* Header */}
          <thead className="text-[#494949] sticky top-0 bg-gray-100 uppercase text-[10px]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 font-medium">
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
                className="border-b border-b-gray-100 last:border-none hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">

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