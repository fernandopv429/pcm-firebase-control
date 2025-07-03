import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { workOrderService, equipmentService, WorkOrder, Equipment } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface ReportsModuleProps {
  empresaId: string;
}

export const ReportsModule = ({ empresaId }: ReportsModuleProps) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("geral");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, equipmentsData] = await Promise.all([
        workOrderService.getByCompany(empresaId),
        equipmentService.getByCompany(empresaId)
      ]);
      setWorkOrders(ordersData);
      setEquipments(equipmentsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMTBF = () => {
    const completedOrders = workOrders.filter(order => order.status === 'concluida');
    if (completedOrders.length === 0) return 0;
    
    // MTBF = tempo total de operação / número de falhas
    // Assumindo 24h por dia e calculando baseado no período
    const totalDays = 30; // Exemplo: últimos 30 dias
    const totalOperatingHours = totalDays * 24 * equipments.length;
    const numberOfFailures = completedOrders.filter(order => order.tipoManutencao === 'corretiva').length;
    
    return numberOfFailures > 0 ? totalOperatingHours / numberOfFailures : 0;
  };

  const calculateMTTR = () => {
    const completedOrders = workOrders.filter(order => 
      order.status === 'concluida' && 
      order.dataConclusao &&
      order.tipoManutencao === 'corretiva'
    );
    
    if (completedOrders.length === 0) return 0;
    
    const totalRepairTime = completedOrders.reduce((sum, order) => {
      if (order.dataConclusao) {
        const diffTime = order.dataConclusao.toDate().getTime() - order.dataAbertura.toDate().getTime();
        const diffHours = diffTime / (1000 * 60 * 60);
        return sum + diffHours;
      }
      return sum;
    }, 0);
    
    return totalRepairTime / completedOrders.length;
  };

  const generateReport = () => {
    // Aqui seria implementada a geração do PDF
    // Por enquanto, apenas mostra uma mensagem
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A geração de PDF será implementada em breve",
    });
  };

  const getEquipmentFailures = () => {
    const failures = new Map();
    
    workOrders.forEach(order => {
      if (order.tipoManutencao === 'corretiva') {
        const count = failures.get(order.equipamentoNome) || 0;
        failures.set(order.equipamentoNome, count + 1);
      }
    });
    
    return Array.from(failures.entries()).sort((a, b) => b[1] - a[1]);
  };

  const getTechnicianPerformance = () => {
    const performance = new Map();
    
    workOrders.forEach(order => {
      if (!performance.has(order.tecnico)) {
        performance.set(order.tecnico, {
          total: 0,
          completed: 0,
          totalTime: 0
        });
      }
      
      const tech = performance.get(order.tecnico);
      tech.total++;
      
      if (order.status === 'concluida' && order.dataConclusao) {
        tech.completed++;
        const diffTime = order.dataConclusao.toDate().getTime() - order.dataAbertura.toDate().getTime();
        const diffHours = diffTime / (1000 * 60 * 60);
        tech.totalTime += diffHours;
      }
    });
    
    return Array.from(performance.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      completed: data.completed,
      avgTime: data.completed > 0 ? (data.totalTime / data.completed).toFixed(1) : 0
    }));
  };

  const mtbf = calculateMTBF();
  const mttr = calculateMTTR();
  const equipmentFailures = getEquipmentFailures();
  const technicianPerformance = getTechnicianPerformance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground">Análise e relatórios de manutenção</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Relatório Geral</SelectItem>
              <SelectItem value="equipamentos">Por Equipamento</SelectItem>
              <SelectItem value="tecnicos">Por Técnico</SelectItem>
              <SelectItem value="periodo">Por Período</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={generateReport} className="bg-gradient-primary hover:opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MTBF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mtbf.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">Tempo médio entre falhas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MTTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mttr.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">Tempo médio de reparo</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total OS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workOrders.length}</div>
                <p className="text-xs text-muted-foreground">Ordens de serviço</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipments.length}</div>
                <p className="text-xs text-muted-foreground">Cadastrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Falhas por Equipamento */}
          <Card>
            <CardHeader>
              <CardTitle>Falhas por Equipamento</CardTitle>
              <CardDescription>Equipamentos com mais falhas corretivas</CardDescription>
            </CardHeader>
            <CardContent>
              {equipmentFailures.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma falha registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipmentFailures.slice(0, 10).map(([equipment, failures], index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <span className="font-medium">{equipment}</span>
                      <span className="text-sm bg-destructive/10 text-destructive px-2 py-1 rounded">
                        {failures} falha(s)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desempenho dos Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Técnicos</CardTitle>
              <CardDescription>Estatísticas de resolução por técnico</CardDescription>
            </CardHeader>
            <CardContent>
              {technicianPerformance.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum técnico com OS</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {technicianPerformance.map((tech, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <span className="font-medium">{tech.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {tech.completed}/{tech.total} OS concluídas
                        </p>
                      </div>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                        {tech.avgTime}h média
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};