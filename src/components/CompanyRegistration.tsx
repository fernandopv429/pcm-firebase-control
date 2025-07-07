import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, ArrowLeft } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { companyService } from "@/lib/firestore";
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
    senha: "",
    plano: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verificar se já existe uma empresa com este email
      const existingCompany = await companyService.getByEmail(formData.emailGestor);
      if (existingCompany) {
        toast({
          title: "Erro no cadastro",
          description: "Já existe uma empresa cadastrada com este e-mail",
          variant: "destructive",
        });
        return;
      }

      // Primeiro criar o usuário no Firebase Auth
      await createUserWithEmailAndPassword(auth, formData.emailGestor, formData.senha);
      
      // Depois criar a empresa no Firestore
      const companyData = {
        nome: formData.nome,
        emailGestor: formData.emailGestor,
        plano: formData.plano
      };
      
      await companyService.create(companyData);
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Agora você pode fazer login no sistema",
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
              Sistema PCM
            </h1>
            <p className="text-muted-foreground">Cadastro de Empresa</p>
          </div>
        </div>

        <Card className="shadow-elevated bg-gradient-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Building className="h-6 w-6" />
              Cadastrar Empresa
            </CardTitle>
            <CardDescription>
              Preencha os dados da sua empresa para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite o nome da empresa"
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
                <Label htmlFor="senha">Senha de Acesso</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite uma senha segura"
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  required
                  minLength={6}
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
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-primary hover:opacity-90 shadow-industrial"
                  disabled={isLoading}
                >
                  <Building className="h-4 w-4 mr-2" />
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Após o cadastro, você poderá fazer login no sistema</p>
        </div>
      </div>
    </div>
  );
};