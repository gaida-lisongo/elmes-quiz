"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { GlobalLoader } from "@/components/common/GlobalLoader";

interface LoaderContextType {
  isLoading: boolean;
  message: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  withLoader: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Chargement...");
  const pathname = usePathname();

  // Auto-hide le loader lors d'un changement de route (filet de sécurité)
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const showLoader = useCallback((msg = "Chargement...") => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoader = useCallback(
    async <T,>(promise: Promise<T>, msg = "Chargement..."): Promise<T> => {
      showLoader(msg);
      try {
        const result = await promise;
        return result;
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader]
  );

  return (
    <LoaderContext.Provider value={{ isLoading, message, showLoader, hideLoader, withLoader }}>
      {children}
      <GlobalLoader isLoading={isLoading} message={message} />
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
