import { useState, useEffect } from "react";

interface PaginatedFetchOptions<T, F> {
  itemsPerPage: number;
  pagesPerBatch: number;
  endpoint: string;
  query?: string;
  filter?: F;
}

export default function usePaginatedFetch<T, F = any>({
  itemsPerPage,
  pagesPerBatch,
  endpoint,
  query = "",
  filter = {} as F,
}: PaginatedFetchOptions<T, F>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageData, setCurrentPageData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage.toString());
      queryParams.append("per_page", itemsPerPage.toString());
      
      if (query) {
        queryParams.append("q", query);
      }
      
      // Add filter parameters
      if (filter && Object.keys(filter).length > 0) {
        for (const [key, value] of Object.entries(filter)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(item => {
                queryParams.append(`${key}[]`, item.toString());
              });
            } else {
              queryParams.append(key, value.toString());
            }
          }
        }
      }
      
      // Fetch data from API
      const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setCurrentPageData(data.items || data);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, query, JSON.stringify(filter)]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    currentPageData,
    isLoading,
    error,
    currentPage,
    totalPages,
    goToPage,
    refresh,
  };
}