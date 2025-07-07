import { useState } from "react";
import { PCMHeader } from "@/components/PCMHeader";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { LoginForm } from "@/components/LoginForm";
import { CompanyRegistration } from "@/components/CompanyRegistration";
import { EquipmentModule } from "@/components/EquipmentModule";
import { WorkOrderModule } from "@/components/WorkOrderModule";
import { TechniciansModule } from "@/components/TechniciansModule";
import { ReportsModule } from "@/components/ReportsModule";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const PCMApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRegistration, setShowRegistration] = useState(false);
  const { user, company, loading, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Sistema PCM",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "E-mail ou senha incorretos",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab("dashboard");
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Não foi possível fazer logout",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    if (!company) return null;
    
    switch (activeTab) {
      case "dashboard":
        return <Dashboard empresaId={company.id} />;
      case "equipment":
        return <EquipmentModule empresaId={company.id} />;
      case "orders":
        return <WorkOrderModule empresaId={company.id} />;
      case "technicians":
        return <TechniciansModule empresaId={company.id} />;
      case "reports":
        return <ReportsModule empresaId={company.id} />;
      default:
        return <Dashboard empresaId={company.id} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegistration) {
      return (
        <CompanyRegistration 
          onBack={() => setShowRegistration(false)}
          onSuccess={() => setShowRegistration(false)}
        />
      );
    }
    
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onRegister={() => setShowRegistration(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PCMHeader 
        userName={user?.displayName || user?.email || "Gestor"}
        companyName={company?.nome || "Empresa"}
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