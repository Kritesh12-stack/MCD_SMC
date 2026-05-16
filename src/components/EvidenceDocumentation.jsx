import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SLOTS = 2;
const MAX_BYTES = 500 * 1024;

const DEFAULT_SLOTS = () =>
  Array.from({ length: MAX_SLOTS }, (_, i) => ({
    file: null,
    previewUrl: null,
    subtext:
      i === 0
        ? "Overall product view"
        : i === 1
          ? "Close-up of surface"
          : "Additional angle / detail",
  }));

function revokeIfNeeded(url) {
  if (url) URL.revokeObjectURL(url);
}

/**
 * Up to 3 JPEG evidence images with per-slot caption (subtext).
 * Upload UI matches ComplainDetailPage recovery form pattern.
 */
export default function EvidenceDocumentation({ onChange }) {
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const slotsRef = useRef(slots);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    if (!onChange) return;
    onChange(
      slots
        .filter((slot) => slot.file)
        .map((slot) => ({
          file: slot.file,
          caption: slot.subtext,
        }))
    );
  }, [slots, onChange]);

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((s) => revokeIfNeeded(s.previewUrl));
    };
  }, []);

  const setSlot = useCallback((index, updater) => {
    setSlots((prev) => {
      const next = prev.map((s, i) => (i === index ? { ...s, ...updater(s) } : s));
      return next;
    });
  }, []);

  const handleFile = useCallback((index, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    const nameOk = /\.jpe?g$/i.test(file.name || "");
    const typeOk = !file.type || /^image\/(jpeg|pjpeg)$/i.test(file.type);
    if (!typeOk && !nameOk) {
      window.alert("Please upload a JPEG image only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      window.alert("Image must be 500 KB or smaller.");
      return;
    }
    setSlots((prev) => {
      const next = [...prev];
      const old = next[index];
      revokeIfNeeded(old.previewUrl);
      next[index] = {
        ...old,
        file,
        previewUrl: URL.createObjectURL(file),
      };
      return next;
    });
  }, []);

  const clearSlot = useCallback((index) => {
    setSlots((prev) => {
      const next = [...prev];
      const old = next[index];
      revokeIfNeeded(old.previewUrl);
      next[index] = { ...old, file: null, previewUrl: null };
      return next;
    });
  }, []);

  return (
    <div className="px-5 pb-5 pt-1">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-4 w-4 items-center justify-center shrink-0 text-[#7C3AED]"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-[14px] font-semibold text-[#2C2C2C]">Evidence &amp; Documentation</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="rounded-md border border-[#DDE2EA] bg-white overflow-hidden flex flex-col shadow-sm w-[260px] max-w-full"
          >
            <div className="relative h-[128px] bg-[#FAFAFA]">
              {slot.previewUrl ? (
                <>
                  <img
                    src={slot.previewUrl}
                    alt={slot.subtext || `Evidence ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => clearSlot(index)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs font-bold hover:bg-black/70"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </>
              ) : (
                <label
                  className="flex h-full cursor-pointer flex-col items-center justify-center border-b border-[#E8E8E8] px-2 hover:bg-gray-100"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFile(index, e.dataTransfer.files);
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm text-[#F11518] font-medium mt-1 text-center">
                    Click to upload{" "}
                    <span className="text-[#888] font-normal">or drag &amp; drop</span>
                  </span>
                  <span className="text-xs text-[#888] mt-0.5">JPEG (max. 500kb)</span>
                  <input
                    type="file"
                    accept="image/jpeg,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      handleFile(index, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <div className="border-t border-[#E8E8E8] bg-white px-3 py-2.5">
              <label className="sr-only" htmlFor={`evidence-caption-${index}`}>
                Caption for image {index + 1}
              </label>
              <input
                id={`evidence-caption-${index}`}
                type="text"
                value={slot.subtext}
                onChange={(e) =>
                  setSlot(index, () => ({ subtext: e.target.value }))
                }
                placeholder="Describe this image"
                className="w-full bg-transparent text-[13px] text-[#494949] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
