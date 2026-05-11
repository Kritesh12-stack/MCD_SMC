import { useEffect, useState } from "react";
import { getBatches } from "../api/batchesApi";
import { STATIC_BATCH_ROWS } from "../data/staticBatchTableRows";
import {
    extractBatchesFromResponse,
    extractBatchesMeta,
    mapApiBatchToTableRow,
} from "../utils/batchListNormalize";

/**
 * Loads GET /batches/ once on mount. On failure or empty `data`, falls back to {@link STATIC_BATCH_ROWS}.
 * Uses `user.access` from localStorage via axios (log in through the app — do not hardcode tokens).
 */
export function useBatchesList() {
    const [rows, setRows] = useState(STATIC_BATCH_ROWS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [fromApi, setFromApi] = useState(false);
    const [meta, setMeta] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            setNotice(null);
            try {
                const res = await getBatches();
                const list = extractBatchesFromResponse(res);
                const mapped = list.map((item, i) => mapApiBatchToTableRow(item, i));
                if (cancelled) return;
                setMeta(extractBatchesMeta(res));
                if (mapped.length > 0) {
                    setRows(mapped);
                    setFromApi(true);
                } else {
                    setRows(STATIC_BATCH_ROWS);
                    setFromApi(false);
                    setNotice(
                        "Server returned 0 batches. Showing sample data until batches exist."
                    );
                }
            } catch (err) {
                if (cancelled) return;
                setRows(STATIC_BATCH_ROWS);
                setFromApi(false);
                setMeta(null);
                setError(err?.message || "Failed to load batches");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { rows, loading, error, notice, fromApi, meta };
}
