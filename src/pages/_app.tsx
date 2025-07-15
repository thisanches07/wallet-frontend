import { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { CategoriesProvider } from "../context/CategoriesContext";
import "../styles/globals.css";
import "../styles/login.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CategoriesProvider>
        <Component {...pageProps} />
      </CategoriesProvider>
    </AuthProvider>
  );
}
