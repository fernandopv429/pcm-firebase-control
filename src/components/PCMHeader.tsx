import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import pcmLogo from "@/assets/pcm-logo.png";

interface PCMHeaderProps {
  userName?: string;
  companyName?: string;
  onLogout?: () => void;
}

export const PCMHeader = ({ userName = "Gestor", companyName = "Empresa", onLogout }: PCMHeaderProps) => {
  return (
    <header className="bg-gradient-primary shadow-industrial border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={pcmLogo} alt="PCM System" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-primary-foreground">Sistema PCM</h1>
            <p className="text-sm text-primary-foreground/80">{companyName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-primary-foreground/90">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{userName}</span>
          </div>
          
          <Button
            variant="ghost" 
            size="sm"
            className="text-primary-foreground hover:bg-white/10 border-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-primary-foreground hover:bg-white/10 border-white/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};