import { createContext, useContext, useEffect, useState } from "react";

interface Seller {
  id?: number;
  name?: string;
  email?: string;
}

interface AuthContextType {
  token: string | null;
  seller: Seller | null;
  loading: boolean;
  login: (token: string, seller: Seller) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedSeller = localStorage.getItem("seller");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedSeller) {
      setSeller(JSON.parse(storedSeller));
    }

    setLoading(false);
  }, []);

  const login = (token: string, seller: Seller) => {
    localStorage.setItem("token", token);
    localStorage.setItem("seller", JSON.stringify(seller));

    setToken(token);
    setSeller(seller);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("seller");

    setToken(null);
    setSeller(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        seller,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext)!;
};