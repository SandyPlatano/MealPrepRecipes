"use client";

import { useState, useMemo, useCallback } from "react";

const MAX_URLS = 5;

export function useUrlInputs() {
  const [urlInputs, setUrlInputs] = useState<string[]>([""]);

  const addUrlInput = useCallback(() => {
    if (urlInputs.length < MAX_URLS) {
      setUrlInputs([...urlInputs, ""]);
    }
  }, [urlInputs]);

  const removeUrlInput = useCallback((index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index));
    }
  }, [urlInputs]);

  const updateUrlInput = useCallback((index: number, value: string) => {
    setUrlInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  }, []);

  const resetUrlInputs = useCallback(() => {
    setUrlInputs([""]);
  }, []);

  const validUrls = useMemo(() => {
    return urlInputs.filter((url) => {
      if (!url.trim()) return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  }, [urlInputs]);

  return {
    urlInputs,
    validUrls,
    maxUrls: MAX_URLS,
    addUrlInput,
    removeUrlInput,
    updateUrlInput,
    resetUrlInputs,
  };
}
