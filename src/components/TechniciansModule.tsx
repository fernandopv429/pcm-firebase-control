import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { workOrderService, WorkOrder } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface TechniciansModuleProps {
  empresaId: string;
}

interface TechnicianSummary {
  nome: string;
  cpf: string;
  totalOS: number;
  osAbertas: number;
  osExecutando: number;
  osConcluidas: number;
  tempoMedioResolucao: number;
}

export const TechniciansModule = ({ empresaId }: TechniciansModuleProps) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = await workOrderService.getByCompany(empresaId);
      setWorkOrders(ordersData);
      
      // Processar dados dos técnicos
      const technicianMap = new Map<string, TechnicianSummary>();
      
      ordersData.forEach(order => {
        const key = `${order.tecnico}-${order.cpfTecnico}`;
        
        if (!technicianMap.has(key)) {
          technicianMap.set(key, {
            nome: order.tecnico,
            cpf: order.cpfTecnico,
            totalOS: 0,
            osAbertas: 0,
            osExecutando: 0,
            osConcluidas: 0,
            tempoMedioResolucao: 0
          });
        }
        
        const tech = technicianMap.get(key)!;
        tech.totalOS++;
        
        switch (order.status) {
          case 'aberta':
            tech.osAbertas++;
            break;
          case 'executando':
            tech.osExecutando++;
            break;
          case 'concluida':
            tech.osConcluidas++;
            break;
        }
      });
      
      // Calcular tempo médio de resolução
      technicianMap.forEach((tech, key) => {
        const techOrders = ordersData.filter(order => 
          `${order.tecnico}-${order.cpfTecnico}` === key && 
          order.status === 'concluida' && 
          order.dataConclusao
        );
        
        if (techOrders.length > 0) {
          const totalTime = techOrders.reduce((sum, order) => {
            if (order.dataConclusao) {
              const diffTime = order.dataConclusao.toDate().getTime() - order.dataAbertura.toDate().getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return sum + diffDays;
            }
            return sum;
          }, 0);
          
          tech.tempoMedioResolucao = totalTime / techOrders.length;
        }
      });
      
      setTechnicians(Array.from(technicianMap.values()));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos técnicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTechnicians = technicians.filter(tech =>
    tech.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Técnicos</h2>
        <p className="text-muted-foreground">Visualize o desempenho dos técnicos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Técnico</CardTitle>
          <CardDescription>
            Pesquise por nome ou CPF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Digite o nome ou CPF do técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Técnicos</CardTitle>
          <CardDescription>
            {filteredTechnicians.length} técnico(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando técnicos...</p>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum técnico encontrado com esse termo" : "Nenhum técnico cadastrado ainda"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Total OS</TableHead>
                  <TableHead>Abertas</TableHead>
                  <TableHead>Executando</TableHead>
                  <TableHead>Concluídas</TableHead>
                  <TableHead>Tempo Médio (dias)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTechnicians.map((tech, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{tech.nome}</TableCell>
                    <TableCell>{formatCPF(tech.cpf)}</TableCell>
                    <TableCell>{tech.totalOS}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {tech.osAbertas}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tech.osExecutando}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {tech.osConcluidas}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tech.tempoMedioResolucao > 0 ? tech.tempoMedioResolucao.toFixed(1) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};