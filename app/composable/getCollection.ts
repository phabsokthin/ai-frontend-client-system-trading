"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";

/* =====================================================================
 *  COLLECTION NAMES & CONSTANTS
 * ===================================================================== */
export const COLLECTIONS = {
  TRADES: "trades",
  SIGNALS: "signals",
  ANALYSIS: "analysis",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS] | string;

/* =====================================================================
 *  TYPE DEFINITIONS
 * ===================================================================== */

export interface FirestoreDocument extends DocumentData {
  id: string;
}

export interface TradeDocument extends DocumentData {
  id?: string;
  ticket?: number | string;
  symbol?: string;
  direction?: "BUY" | "SELL" | string;
  action?: "BUY" | "SELL" | string;
  entry_price?: number;
  exit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  sl?: number;
  tp?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  volume?: number;
  status?: "OPEN" | "CLOSED" | "CLOSED_TP" | "CLOSED_SL" | "MANUALLY_CLOSED" | string;
  pnl_points?: number;
  final_pnl_points?: number;
  profit?: number;
  reason?: string;
  exit_reason?: string;
  entry_time?: string;
  exit_time?: string;
  timeframe?: string;
  source?: "ai_signal" | "manual_web" | "mt5_sync" | string;
  comment?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SignalDocument extends DocumentData {
  id?: string;
  setup_id?: string;
  analysis_id?: string;
  timestamp_utc?: string;
  symbol?: string;
  signal?: "BUY" | "SELL" | "WAIT" | string;
  action?: string;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  confidence?: string;
  reason?: string;
  is_new_entry?: boolean;
  timeframe?: string;
  setup?: {
    direction?: string;
    entry_price?: number;
    stop_loss?: number;
    take_profit?: number;
    tp1?: number;
    tp2?: number;
    tp3?: number;
    confidence?: string;
    risk_reward_ratio?: number;
    reasons?: string[];
  };
  createdAt?: any;
}

export interface AnalysisDocument extends DocumentData {
  id?: string;
  timestamp_utc?: string;
  symbol?: string;
  price?: number;
  signal?: string;
  action?: string;
  trade_status?: string;
  reason?: string;
  stop_loss?: number;
  take_profit?: number;
  sl?: number;
  tp?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  is_new_entry?: boolean;
  multi_timeframe?: {
    analysis_timeframe?: string;
    htf_trend?: string;
    htf_rsi?: number;
    entry_timeframe?: string;
    entry_signal?: string;
    ltf_signal?: string;
    timeframe_aligned?: boolean;
  };
  technical_indicators?: {
    rsi14?: number;
    ema9?: number;
    ema21?: number;
    ema50?: number;
    ema200?: number;
    atr14?: number;
    adx14?: number;
    macd?: {
      macd?: number;
      signal?: number;
      hist?: number;
    };
    [key: string]: any;
  };
  support_resistance?: {
    current_price?: number;
    pivot_point?: number;
    nearest_support?: number;
    nearest_resistance?: number;
    zone?: string;
    [key: string]: any;
  };
  news_filter?: {
    allowed?: boolean;
    reason?: string;
    news_analysis?: any;
    [key: string]: any;
  };
  ai_analysis?: {
    ai_bias?: string;
    ai_confidence?: number | string;
    model_agreement?: boolean;
    reasoning?: string;
    [key: string]: any;
  };
  risk_levels?: any;
  trading_mode?: string;
  createdAt?: any;
}

/* =====================================================================
 *  GENERIC FIRESTORE COLLECTION HOOK (ORDERED DESC)
 * ===================================================================== */

// Helper to extract timestamp for in-memory sorting
function getTimestampValue(item: any): number {
  if (!item) return 0;
  if (item.createdAt?.toDate) return item.createdAt.toDate().getTime();
  if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
  const str = item.createdAt || item.timestamp_utc || item.entry_time;
  if (str) {
    const t = new Date(str).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

export const getCollection = <T extends DocumentData = FirestoreDocument>(
  collectionName: CollectionName,
  ...queryConstraints: QueryConstraint[]
) => {
  const [document, setDocument] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Apply query with constraints, defaulting to orderBy("createdAt", "desc")
    const constraints = queryConstraints.length > 0
      ? queryConstraints
      : [orderBy("createdAt", "desc")];

    let collectionRef;
    try {
      collectionRef = query(collection(db, collectionName), ...constraints);
    } catch {
      collectionRef = query(collection(db, collectionName));
    }

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...(doc.data() as T),
          })
        );

        // Guarantee descending order (newest first)
        result.sort((a, b) => {
          const timeA = getTimestampValue(a);
          const timeB = getTimestampValue(b);
          if (timeA && timeB && timeA !== timeB) {
            return timeB - timeA;
          }
          return String(b.id || "").localeCompare(String(a.id || ""));
        });

        setDocument(result);
        setLoading(false);
      },
      (err) => {
        // Fallback query without orderBy index if Firestore index is missing
        console.warn(`Firestore orderBy index warning for [${collectionName}], falling back to basic query:`, err);
        const fallbackRef = query(collection(db, collectionName));
        onSnapshot(
          fallbackRef,
          (snapshot) => {
            const fallbackResult = snapshot.docs.map(
              (doc: QueryDocumentSnapshot<DocumentData>) => ({
                id: doc.id,
                ...(doc.data() as T),
              })
            );

            // In-memory descending sort
            fallbackResult.sort((a, b) => {
              const timeA = getTimestampValue(a);
              const timeB = getTimestampValue(b);
              if (timeA && timeB && timeA !== timeB) {
                return timeB - timeA;
              }
              return String(b.id || "").localeCompare(String(a.id || ""));
            });

            setDocument(fallbackResult);
            setLoading(false);
          },
          (fallbackErr) => {
            console.error(`Error fetching collection [${collectionName}]:`, fallbackErr);
            setError(fallbackErr);
            setLoading(false);
          }
        );
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return {
    document,
    data: document,
    loading,
    error,
  };
};

/* =====================================================================
 *  CONVENIENCE TYPED HOOKS (ORDERED DESC)
 * ===================================================================== */

export const useTrades = (...constraints: QueryConstraint[]) =>
  getCollection<TradeDocument>(
    COLLECTIONS.TRADES,
    ...(constraints.length > 0 ? constraints : [orderBy("createdAt", "desc")])
  );

export const useSignals = (...constraints: QueryConstraint[]) =>
  getCollection<SignalDocument>(
    COLLECTIONS.SIGNALS,
    ...(constraints.length > 0 ? constraints : [orderBy("createdAt", "desc")])
  );

export const useAnalysis = (...constraints: QueryConstraint[]) =>
  getCollection<AnalysisDocument>(
    COLLECTIONS.ANALYSIS,
    ...(constraints.length > 0 ? constraints : [orderBy("createdAt", "desc")])
  );

/* =====================================================================
 *  PAGINATION INTERFACES & HELPERS
 * ===================================================================== */

export interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export interface PaginatedResult<T> {
  // Data
  data: T[];
  allData: T[] | null;
  loading: boolean;
  error: Error | null;

  // Pagination state
  page: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  startIndex: number;
  endIndex: number;

  // Flags
  hasNextPage: boolean;
  hasPrevPage: boolean;
  canNext: boolean;
  canPrev: boolean;

  // Actions
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  goToPage: (page: number) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // UI Helper
  getPageNumbers: (maxVisible?: number) => (number | string)[];
}

/**
 * Pure client-side pagination hook for any array (filtered trades, signals, search results, etc.)
 */
export function usePagination<T>(
  items: T[] = [],
  options?: PaginationOptions
): Omit<PaginatedResult<T>, "allData" | "loading" | "error"> & {
  paginatedItems: T[];
  allData: T[];
} {
  const [page, setPage] = useState<number>(options?.initialPage || 1);
  const [pageSize, setPageSize] = useState<number>(options?.pageSize || 10);

  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto-clamp page if it exceeds totalPages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items ? items.slice(startIndex, endIndex) : [];

  const from = totalItems === 0 ? 0 : startIndex + 1;
  const to = Math.min(endIndex, totalItems);

  const goToPage = (p: number) => {
    const target = Math.max(1, Math.min(p, totalPages));
    setPage(target);
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const firstPage = () => {
    setPage(1);
  };

  const lastPage = () => {
    setPage(totalPages);
  };

  const handleSetPageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const getPageNumbers = (maxVisible: number = 7): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return {
    data: paginatedItems,
    paginatedItems,
    allData: items,
    page,
    currentPage: page,
    pageSize,
    totalPages,
    totalItems,
    from,
    to,
    startIndex,
    endIndex,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    canNext: page < totalPages,
    canPrev: page > 1,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    goToPage,
    setPage: goToPage,
    setPageSize: handleSetPageSize,
    getPageNumbers,
  };
}

/* =====================================================================
 *  REAL-TIME PAGINATED FIRESTORE COLLECTION HOOK
 * ===================================================================== */

export const usePaginatedCollection = <T extends DocumentData = FirestoreDocument>(
  collectionName: CollectionName,
  options?: PaginationOptions,
  ...queryConstraints: QueryConstraint[]
): PaginatedResult<T & { id: string }> => {
  const { data: allData, loading, error } = getCollection<T>(collectionName, ...queryConstraints);
  const pagination = usePagination<T & { id: string }>(allData || [], options);

  return {
    ...pagination,
    allData,
    loading,
    error,
  };
};

/* =====================================================================
 *  TYPED REAL-TIME PAGINATED COLLECTION HOOKS
 * ===================================================================== */

export const usePaginatedTrades = (
  options?: PaginationOptions,
  ...constraints: QueryConstraint[]
) =>
  usePaginatedCollection<TradeDocument>(
    COLLECTIONS.TRADES,
    options,
    ...(constraints.length > 0 ? constraints : [orderBy("createdAt", "desc")])
  );

export const usePaginatedSignals = (
  options?: PaginationOptions,
  ...constraints: QueryConstraint[]
) =>
  usePaginatedCollection<SignalDocument>(
    COLLECTIONS.SIGNALS,
    options,
    ...(constraints.length > 0 ? constraints : [orderBy("createdAt", "desc")])
  );

export const usePaginatedAnalysis = (
  options?: PaginationOptions,
  ...constraints: QueryConstraint[]
) =>
  usePaginatedCollection<AnalysisDocument>(
    COLLECTIONS.ANALYSIS,
    options,
    ...(constraints.length > 0 ? constraints : [orderBy("createdAt", "desc")])
  );

/* =====================================================================
 *  FIRESTORE CURSOR-BASED PAGINATION HELPER
 * ===================================================================== */

export interface CursorPaginationResult<T> {
  data: (T & { id: string })[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const fetchPaginatedCollection = async <T extends DocumentData = FirestoreDocument>(
  collectionName: CollectionName,
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null,
  ...extraConstraints: QueryConstraint[]
): Promise<CursorPaginationResult<T>> => {
  const { getDocs, startAfter: firestoreStartAfter } = await import("firebase/firestore");

  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    ...(lastDoc ? [firestoreStartAfter(lastDoc)] : []),
    limit(pageSize + 1), // fetch 1 extra to determine if there are more
    ...extraConstraints,
  ];

  let snapshot;
  try {
    const q = query(collection(db, collectionName), ...constraints);
    snapshot = await getDocs(q);
  } catch (err) {
    console.warn(`Cursor pagination failed with orderBy, falling back to simple query:`, err);
    const fallbackConstraints: QueryConstraint[] = [
      limit(pageSize + 1),
      ...extraConstraints,
    ];
    const q = query(collection(db, collectionName), ...fallbackConstraints);
    snapshot = await getDocs(q);
  }

  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const newLastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

  const data = resultDocs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as T),
  }));

  return {
    data,
    lastDoc: newLastDoc,
    hasMore,
  };
};

export { orderBy, limit };
export default getCollection;

