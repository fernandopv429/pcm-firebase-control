import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Users, 
  Wrench,
  Calendar
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "equipment", label: "Equipamentos", icon: Settings },
    { id: "orders", label: "Ordens de Serviço", icon: Wrench },
    { id: "technicians", label: "Técnicos", icon: Users },
    { id: "reports", label: "Relatórios", icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-card border-b border-border/50 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 ${
                  isActive 
                    ? "bg-gradient-primary shadow-industrial" 
                    : "hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};