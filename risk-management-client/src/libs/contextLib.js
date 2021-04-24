import { useContext, createContext } from "react";

// Using the createContext API to create a new context for our app.
export const AppContext = createContext(null);


export function useAppContext() {
  // Using the useContext React Hook to access the context.
  return useContext(AppContext);
}