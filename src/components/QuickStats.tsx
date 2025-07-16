import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Wrench,
  Calendar
} from "lucide-react";
import { WorkOrder, Equipment, workOrderService, equipmentService } from "@/lib/firestore";

interface QuickStatsProps {
  empresaId: string;
}

interface Stats {
  totalEquipments: number;
  activeOrders: number;
  completedThisMonth: number;
  overdueOrders: number;
  avgResolutionTime: number;
  preventiveVsCorrective: {
    preventive: number;
    corrective: number;
  };
  monthlyTrend: number;
}

export const QuickStats = ({ empresaId }: QuickStatsProps) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [empresaId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [equipments, workOrders] = await Promise.all([
        equipmentService.getByCompany(empresaId),
        workOrderService.getByCompany(empresaId)
      ]);

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Calcular estatísticas
      const activeOrders = workOrders.filter(order => 
        order.status === 'aberta' || order.status === 'executando'
      ).length;

      const completedThisMonth = workOrders.filter(order => 
        order.status === 'concluida' && 
        order.dataConclusao && 
        order.dataConclusao.toDate() >= thisMonth
      ).length;

      const completedLastMonth = workOrders.filter(order => 
        order.status === 'concluida' && 
        order.dataConclusao && 
        order.dataConclusao.toDate() >= lastMonth &&
        order.dataConclusao.toDate() < thisMonth
      ).length;

      const overdueOrders = workOrders.filter(order => {
        if (order.status !== 'aberta') return false;
        const daysSinceOpened = (now.getTime() - order.dataAbertura.toDate().getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceOpened > 7; // Considerar atrasado após 7 dias
      }).length;

      // Calcular tempo médio de resolução
      const completedOrders = workOrders.filter(order => 
        order.status === 'concluida' && order.dataConclusao
      );
      
      const avgResolutionTime = completedOrders.length > 0 
        ? completedOrders.reduce((sum, order) => {
            const resolutionTime = order.dataConclusao!.toDate().getTime() - order.dataAbertura.toDate().getTime();
            return sum + (resolutionTime / (1000 * 60 * 60)); // em horas
          }, 0) / completedOrders.length
        : 0;

      // Preventiva vs Corretiva
      const preventiveCount = workOrders.filter(order => order.tipoManutencao === 'preventiva').length;
      const correctiveCount = workOrders.filter(order => order.tipoManutencao === 'corretiva').length;

      // Tendência mensal
      const monthlyTrend = completedLastMonth > 0 
        ? ((completedThisMonth - completedLastMonth) / completedLastMonth) * 100
        : 0;

      setStats({
        totalEquipments: equipments.length,
        activeOrders,
        completedThisMonth,
        overdueOrders,
        avgResolutionTime,
        preventiveVsCorrective: {
          preventive: preventiveCount,
          corrective: correctiveCount
        },
        monthlyTrend
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Erro ao carregar estatísticas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">OS Ativas</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeOrders}</div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
            {stats.overdueOrders > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.overdueOrders} atrasadas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-status-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
            {stats.monthlyTrend !== 0 && (
              <div className={`flex items-center text-xs ${
                stats.monthlyTrend > 0 ? 'text-status-success' : 'text-status-error'
              }`}>
                {stats.monthlyTrend > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.monthlyTrend).toFixed(1)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgResolutionTime.toFixed(1)}h
          </div>
          <p className="text-xs text-muted-foreground">
            Resolução de OS
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
          <Wrench className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.preventiveVsCorrective.preventive + stats.preventiveVsCorrective.corrective}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="default" className="text-xs">
              {stats.preventiveVsCorrective.preventive} Prev
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats.preventiveVsCorrective.corrective} Corr
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};