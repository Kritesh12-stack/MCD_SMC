export const STATUS_LABELS = {
    pending:        "Pending",
    senttovendor:   "Sent To Vendor",
    vendoraccepted: "Vendor Accepted",
    vendorrejected: "Vendor Rejected",
    justified:      "Justified",
    unjustified:    "Unjustified",
    closed:         "Closed",
    destroyed:      "Destroyed",
    recalled:       "Recalled",
    released:       "Released",
};

export const STATUS_COLORS = {
    pending:        "bg-blue-100 text-blue-700 border-blue-300",
    senttovendor:   "bg-purple-100 text-purple-700 border-purple-300",
    vendoraccepted: "bg-green-100 text-green-700 border-green-300",
    vendorrejected: "bg-red-100 text-red-700 border-red-300",
    justified:      "bg-green-100 text-green-700 border-green-300",
    unjustified:    "bg-red-100 text-red-700 border-red-300",
    closed:         "bg-gray-100 text-gray-700 border-gray-300",
    destroyed:      "bg-red-100 text-red-800 border-red-500",
    recalled:       "bg-orange-100 text-orange-700 border-orange-300",
    released:       "bg-teal-100 text-teal-700 border-teal-300",
};

export function getStatusLabel(value) {
    return STATUS_LABELS[value?.toLowerCase()?.replace(/\s/g, "")] || value || "—";
}

export function getStatusColor(value) {
    return STATUS_COLORS[value?.toLowerCase()?.replace(/\s/g, "")] || STATUS_COLORS.pending;
}
