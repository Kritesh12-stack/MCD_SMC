import { useContext, useState, useCallback } from "react";
import { createContext } from "react";

const ModuleContext = createContext();

const STORAGE_KEY = "mcd-smc-active-module";

function readStoredModule() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStoredModule(value) {
  try {
    if (value === "" || value == null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  } catch {
    /* quota or private mode */
  }
}

export function ModuleProvider({ children }) {
  const [module, setModuleState] = useState(readStoredModule);

  const setModule = useCallback((next) => {
    setModuleState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      writeStoredModule(value);
      return value;
    });
  }, []);

  return (
    <ModuleContext.Provider value={{ module, setModule }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModule must be used within a ModuleProvider");
  }
  return context;
}
