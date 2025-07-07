import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import pcmLogo from "@/assets/pcm-logo.png";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: () => void;
  isLoading?: boolean;
}

export const LoginForm = ({ onLogin, onRegister, isLoading = false }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <img src={pcmLogo} alt="PCM System" className="h-20 w-auto mx-auto" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Sistema PCM
            </h1>
            <p className="text-muted-foreground">Planejamento e Controle da Manutenção</p>
          </div>
        </div>

        <Card className="shadow-elevated bg-gradient-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Acesso do Gestor</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="gestor@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 shadow-industrial"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Sistema multiempresa para gestão de manutenção</p>
          <div className="pt-2">
            <span>Não tem uma empresa cadastrada? </span>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary underline hover:no-underline"
              onClick={onRegister}
            >
              Cadastre sua empresa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};