import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowLeft } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { companyService, Company } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import pcmLogo from "@/assets/pcm-logo.png";

interface CompanyRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CompanyRegistration = ({ onBack, onSuccess }: CompanyRegistrationProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    emailGestor: "",
    password: "",
    confirmPassword: "",
    plano: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro na validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro na validação",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Criar usuário no Firebase Auth
      await createUserWithEmailAndPassword(auth, formData.emailGestor, formData.password);
      
      // 2. Criar empresa no Firestore
      const companyData: Omit<Company, 'id' | 'createdAt'> = {
        nome: formData.nome,
        emailGestor: formData.emailGestor,
        plano: formData.plano
      };
      
      await companyService.create(companyData);
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Agora você pode fazer login com suas credenciais.",
      });
      
      onSuccess();
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível cadastrar a empresa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <img src={pcmLogo} alt="PCM System" className="h-20 w-auto mx-auto" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cadastro de Empresa
            </h1>
            <p className="text-muted-foreground">Registre sua empresa no Sistema PCM</p>
          </div>
        </div>

        <Card className="shadow-elevated bg-gradient-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Nova Empresa</CardTitle>
            <CardDescription>
              Preencha os dados para cadastrar sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Minha Empresa Ltda"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailGestor">E-mail do Gestor</Label>
                <Input
                  id="emailGestor"
                  type="email"
                  placeholder="gestor@empresa.com"
                  value={formData.emailGestor}
                  onChange={(e) => handleInputChange("emailGestor", e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plano">Plano</Label>
                <Select onValueChange={(value) => handleInputChange("plano", value)} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>

                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-primary hover:opacity-90 shadow-industrial"
                  disabled={isLoading}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Após o cadastro, você poderá acessar o sistema com suas credenciais</p>
        </div>
      </div>
    </div>
  );
};