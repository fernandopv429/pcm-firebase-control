import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { companyService, Company } from "@/lib/firestore";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user?.email) {
        try {
          const companyData = await companyService.getByEmail(user.email);
          setCompany(companyData);
        } catch (error) {
          console.error("Erro ao buscar dados da empresa:", error);
          setCompany(null);
        }
      } else {
        setCompany(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Buscar dados da empresa
      const companyData = await companyService.getByEmail(email);
      if (!companyData) {
        throw new Error("Empresa não encontrada para este e-mail");
      }
      
      setCompany(companyData);
      return userCredential.user;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCompany(null);
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  };

  return {
    user,
    company,
    loading,
    isAuthenticated: !!user && !!company,
    login,
    logout
  };
};