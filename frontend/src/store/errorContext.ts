import { createContext } from "react";

const ErrorContext = createContext<{
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}>({ errorMessage: "", setErrorMessage: () => {} });

export default ErrorContext;
