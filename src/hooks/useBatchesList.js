import { useEffect, useState } from "react";
import { getBatches } from "../api/batchesApi";
import {
    extractBatchesFromResponse,
    extractBatchesMeta,
    mapApiBatchToTableRow,
} from "../utils/batchListNormalize";

export function useBatchesList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await getBatches();
                const list = extractBatchesFromResponse(res);
                const mapped = list.map((item, i) => mapApiBatchToTableRow(item, i));
                if (cancelled) return;
                setMeta(extractBatchesMeta(res));
                setRows(mapped);
            } catch (err) {
                if (cancelled) return;
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

    return { rows, loading, error, meta };
}
