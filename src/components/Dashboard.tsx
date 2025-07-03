import { KPICard } from "./KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  FileText,
  Settings,
  Users
} from "lucide-react";

export const Dashboard = () => {
  const kpiData = [
    {
      title: "MTBF (Tempo Médio Entre Falhas)",
      value: "45.2h",
      subtitle: "Últimos 30 dias",
      icon: <Clock className="h-4 w-4" />,
      trend: "up" as const,
      trendValue: "+5.2h"
    },
    {
      title: "MTTR (Tempo Médio de Reparo)",
      value: "2.8h", 
      subtitle: "Últimos 30 dias",
      icon: <Settings className="h-4 w-4" />,
      trend: "down" as const,
      trendValue: "-0.5h"
    },
    {
      title: "Total de OS",
      value: "24",
      subtitle: "Este mês",
      icon: <FileText className="h-4 w-4" />,
      trend: "up" as const,
      trendValue: "+12%"
    },
    {
      title: "Técnicos Ativos",
      value: "8",
      subtitle: "Trabalhando hoje",
      icon: <Users className="h-4 w-4" />,
      trend: "neutral" as const
    }
  ];

  const recentOrders = [
    { id: "OS-001", equipment: "Compressor A1", technician: "João Silva", status: "Executando", priority: "Alta" },
    { id: "OS-002", equipment: "Bomba B2", technician: "Maria Santos", status: "Concluída", priority: "Média" },
    { id: "OS-003", equipment: "Motor C3", technician: "Pedro Costa", status: "Aberta", priority: "Baixa" },
    { id: "OS-004", equipment: "Ventilador D4", technician: "Ana Souza", status: "Executando", priority: "Alta" }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "Aberta": "bg-status-warning text-white",
      "Executando": "bg-status-info text-white", 
      "Concluída": "bg-status-success text-white",
      "Cancelada": "bg-status-error text-white"
    };
    return statusMap[status as keyof typeof statusMap] || "bg-muted";
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-gradient-primary shadow-industrial">
          <Plus className="h-4 w-4 mr-2" />
          Nova OS
        </Button>
        <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
          <Plus className="h-4 w-4 mr-2" />
          Equipamento
        </Button>
        <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
          <FileText className="h-4 w-4 mr-2" />
          Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Recent Orders and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Work Orders */}
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Ordens Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{order.id}</span>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.equipment}</p>
                    <p className="text-xs text-muted-foreground">Técnico: {order.technician}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {order.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Status das OS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-warning"></div>
                  <span className="text-sm">Abertas</span>
                </div>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-info"></div>
                  <span className="text-sm">Em Execução</span>
                </div>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-success"></div>
                  <span className="text-sm">Concluídas</span>
                </div>
                <span className="font-medium">11</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-error"></div>
                  <span className="text-sm">Canceladas</span>
                </div>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Health Alert */}
      <Card className="bg-gradient-card shadow-card border-border/50 border-l-4 border-l-status-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-status-warning mt-0.5" />
            <div>
              <h3 className="font-medium">Atenção: Equipamentos com Manutenção Pendente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                3 equipamentos estão próximos do prazo de manutenção preventiva. 
                <Button variant="link" className="p-0 h-auto text-primary">
                  Ver detalhes
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};