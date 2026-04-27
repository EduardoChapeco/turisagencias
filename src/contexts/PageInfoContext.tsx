import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PageInfo {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

interface PageInfoContextValue {
  pageInfo: PageInfo | null;
  setPageInfo: (info: PageInfo | null) => void;
}

export const PageInfoContext = createContext<PageInfoContextValue>({
  pageInfo: null,
  setPageInfo: () => {},
});

export function PageInfoProvider({ children }: { children: React.ReactNode }) {
  const [pageInfo, setPageInfoState] = useState<PageInfo | null>(null);

  const setPageInfo = useCallback((info: PageInfo | null) => {
    setPageInfoState(info);
  }, []);

  return (
    <PageInfoContext.Provider value={{ pageInfo, setPageInfo }}>
      {children}
    </PageInfoContext.Provider>
  );
}

export function usePageInfo() {
  return useContext(PageInfoContext);
}
