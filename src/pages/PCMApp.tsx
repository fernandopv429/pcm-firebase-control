import { useState } from "react";
import { PCMHeader } from "@/components/PCMHeader";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { LoginForm } from "@/components/LoginForm";
import { useToast } from "@/hooks/use-toast";

export const PCMApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState({
    userName: "Gestor Principal",
    companyName: "Empresa Demo"
  });
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Simular login - aqui seria integrado com Firebase Auth
    console.log("Login attempt:", { email, password });
    
    // Demo credentials
    if (email === "gestor@empresa.com" && password === "123456") {
      setIsLoggedIn(true);
      setUserData({
        userName: "João Silva",
        companyName: "Indústria XYZ"
      });
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Sistema PCM",
      });
    } else {
      toast({
        title: "Erro no login",
        description: "E-mail ou senha incorretos",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("dashboard");
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "equipment":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Equipamentos</h2>
            <p className="text-muted-foreground">Módulo de equipamentos em desenvolvimento...</p>
          </div>
        );
      case "orders":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ordens de Serviço</h2>
            <p className="text-muted-foreground">Módulo de OS em desenvolvimento...</p>
          </div>
        );
      case "technicians":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Técnicos</h2>
            <p className="text-muted-foreground">Módulo de técnicos em desenvolvimento...</p>
          </div>
        );
      case "reports":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Relatórios</h2>
            <p className="text-muted-foreground">Módulo de relatórios em desenvolvimento...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PCMHeader 
        userName={userData.userName}
        companyName={userData.companyName}
        onLogout={handleLogout}
      />
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <main className="container mx-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
};