import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Equipment, WorkOrder, equipmentService, workOrderService } from "@/lib/firestore";

interface EquipmentHealthCheckProps {
  empresaId: string;
}

interface EquipmentHealth {
  equipment: Equipment;
  status: 'healthy' | 'warning' | 'critical';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  mtbf: number;
  failureCount: number;
}

export const EquipmentHealthCheck = ({ empresaId }: EquipmentHealthCheckProps) => {
  const [equipmentHealth, setEquipmentHealth] = useState<EquipmentHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipmentHealth();
  }, [empresaId]);

  const loadEquipmentHealth = async () => {
    try {
      setLoading(true);
      const [equipments, workOrders] = await Promise.all([
        equipmentService.getByCompany(empresaId),
        workOrderService.getByCompany(empresaId)
      ]);

      const healthData: EquipmentHealth[] = equipments.map(equipment => {
        const equipmentOrders = workOrders.filter(order => order.equipamentoId === equipment.id);
        const completedOrders = equipmentOrders.filter(order => order.status === 'concluida');
        const failureCount = equipmentOrders.filter(order => order.tipoManutencao === 'corretiva').length;
        
        // Calcular MTBF (Mean Time Between Failures)
        const daysSinceInstallation = Math.floor(
          (Date.now() - equipment.dataInstalacao.toDate().getTime()) / (1000 * 60 * 60 * 24)
        );
        const mtbf = failureCount > 0 ? daysSinceInstallation / failureCount : daysSinceInstallation;

        // Encontrar última manutenção
        const lastMaintenance = completedOrders.length > 0 
          ? completedOrders.sort((a, b) => b.dataConclusao!.toDate().getTime() - a.dataConclusao!.toDate().getTime())[0].dataConclusao!.toDate()
          : undefined;

        // Calcular próxima manutenção (assumindo ciclo de 90 dias para preventiva)
        const nextMaintenance = lastMaintenance 
          ? new Date(lastMaintenance.getTime() + 90 * 24 * 60 * 60 * 1000)
          : new Date(equipment.dataInstalacao.toDate().getTime() + 90 * 24 * 60 * 60 * 1000);

        // Determinar status de saúde
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        const daysSinceLastMaintenance = lastMaintenance 
          ? Math.floor((Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
          : daysSinceInstallation;

        if (daysSinceLastMaintenance > 90) {
          status = 'critical';
        } else if (daysSinceLastMaintenance > 60) {
          status = 'warning';
        }

        // Considerar falhas frequentes
        if (failureCount > 3) {
          status = 'critical';
        } else if (failureCount > 1) {
          status = status === 'healthy' ? 'warning' : status;
        }

        return {
          equipment,
          status,
          lastMaintenance,
          nextMaintenance,
          mtbf,
          failureCount
        };
      });

      setEquipmentHealth(healthData);
    } catch (error) {
      console.error("Erro ao carregar saúde dos equipamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-status-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'critical': return <XCircle className="h-4 w-4 text-status-error" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthScore = (equipment: EquipmentHealth) => {
    let score = 100;
    
    if (equipment.status === 'critical') score -= 40;
    else if (equipment.status === 'warning') score -= 20;
    
    if (equipment.failureCount > 3) score -= 20;
    else if (equipment.failureCount > 1) score -= 10;
    
    if (equipment.mtbf < 30) score -= 20;
    else if (equipment.mtbf < 60) score -= 10;
    
    return Math.max(0, score);
  };

  const overallHealthScore = equipmentHealth.length > 0 
    ? equipmentHealth.reduce((sum, eq) => sum + getHealthScore(eq), 0) / equipmentHealth.length
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saúde dos Equipamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Analisando equipamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Saúde dos Equipamentos
          <Badge variant="outline" className="ml-auto">
            Score: {overallHealthScore.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Saúde Geral</span>
              <span>{overallHealthScore.toFixed(0)}%</span>
            </div>
            <Progress value={overallHealthScore} className="h-2" />
          </div>

          {equipmentHealth.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum equipamento cadastrado
            </p>
          ) : (
            <div className="space-y-3">
              {equipmentHealth.map((item) => (
                <div
                  key={item.equipment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-medium">{item.equipment.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.equipment.local}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <div>MTBF: {item.mtbf.toFixed(0)}d</div>
                      <div className="text-muted-foreground">
                        {item.failureCount} falhas
                      </div>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status === 'healthy' ? 'Saudável' : 
                       item.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};