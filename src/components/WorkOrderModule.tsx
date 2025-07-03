import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Wrench } from "lucide-react";
import { workOrderService, WorkOrder, equipmentService, Equipment } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface WorkOrderModuleProps {
  empresaId: string;
}

export const WorkOrderModule = ({ empresaId }: WorkOrderModuleProps) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    equipamentoId: "",
    tecnico: "",
    cpfTecnico: "",
    dataAbertura: new Date().toISOString().split('T')[0],
    dataConclusao: "",
    tipoManutencao: "preventiva" as "preventiva" | "corretiva",
    tempoParada: 0,
    status: "aberta" as "aberta" | "executando" | "concluida" | "cancelada",
    observacoes: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedEquipment = equipments.find(eq => eq.id === formData.equipamentoId);
      if (!selectedEquipment) {
        toast({
          title: "Erro",
          description: "Selecione um equipamento válido",
          variant: "destructive",
        });
        return;
      }

      const orderData = {
        empresaId,
        equipamentoId: formData.equipamentoId,
        equipamentoNome: selectedEquipment.nome,
        tecnico: formData.tecnico,
        cpfTecnico: formData.cpfTecnico,
        dataAbertura: Timestamp.fromDate(new Date(formData.dataAbertura)),
        dataConclusao: formData.dataConclusao ? Timestamp.fromDate(new Date(formData.dataConclusao)) : undefined,
        tipoManutencao: formData.tipoManutencao,
        tempoParada: formData.tempoParada,
        status: formData.status,
        observacoes: formData.observacoes
      };

      if (editingOrder) {
        await workOrderService.update(editingOrder.id, orderData);
        toast({
          title: "Sucesso",
          description: "Ordem de serviço atualizada com sucesso!",
        });
      } else {
        await workOrderService.create(orderData);
        toast({
          title: "Sucesso",
          description: "Ordem de serviço criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingOrder(null);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a ordem de serviço",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      equipamentoId: "",
      tecnico: "",
      cpfTecnico: "",
      dataAbertura: new Date().toISOString().split('T')[0],
      dataConclusao: "",
      tipoManutencao: "preventiva",
      tempoParada: 0,
      status: "aberta",
      observacoes: ""
    });
  };

  const handleEdit = (order: WorkOrder) => {
    setEditingOrder(order);
    setFormData({
      equipamentoId: order.equipamentoId,
      tecnico: order.tecnico,
      cpfTecnico: order.cpfTecnico,
      dataAbertura: order.dataAbertura.toDate().toISOString().split('T')[0],
      dataConclusao: order.dataConclusao ? order.dataConclusao.toDate().toISOString().split('T')[0] : "",
      tipoManutencao: order.tipoManutencao,
      tempoParada: order.tempoParada,
      status: order.status,
      observacoes: order.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      try {
        await workOrderService.delete(id);
        toast({
          title: "Sucesso",
          description: "Ordem de serviço excluída com sucesso!",
        });
        loadData();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a ordem de serviço",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberta": return "destructive";
      case "executando": return "secondary";
      case "concluida": return "default";
      case "cancelada": return "outline";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aberta": return "Aberta";
      case "executando": return "Executando";
      case "concluida": return "Concluída";
      case "cancelada": return "Cancelada";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie as ordens de serviço da sua empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da ordem de serviço
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipamentoId">Equipamento</Label>
                  <Select value={formData.equipamentoId} onValueChange={(value) => setFormData({ ...formData, equipamentoId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipments.map((equipment) => (
                        <SelectItem key={equipment.id} value={equipment.id}>
                          {equipment.nome} - {equipment.local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tecnico">Técnico</Label>
                  <Input
                    id="tecnico"
                    value={formData.tecnico}
                    onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                    placeholder="Nome do técnico"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfTecnico">CPF do Técnico</Label>
                  <Input
                    id="cpfTecnico"
                    value={formData.cpfTecnico}
                    onChange={(e) => setFormData({ ...formData, cpfTecnico: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoManutencao">Tipo de Manutenção</Label>
                  <Select value={formData.tipoManutencao} onValueChange={(value: "preventiva" | "corretiva") => setFormData({ ...formData, tipoManutencao: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataAbertura">Data de Abertura</Label>
                  <Input
                    id="dataAbertura"
                    type="date"
                    value={formData.dataAbertura}
                    onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataConclusao">Data de Conclusão</Label>
                  <Input
                    id="dataConclusao"
                    type="date"
                    value={formData.dataConclusao}
                    onChange={(e) => setFormData({ ...formData, dataConclusao: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempoParada">Tempo de Parada (horas)</Label>
                  <Input
                    id="tempoParada"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.tempoParada}
                    onChange={(e) => setFormData({ ...formData, tempoParada: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="executando">Executando</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações sobre a ordem de serviço..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingOrder ? "Atualizar" : "Criar OS"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>
            {workOrders.length} ordem(ns) de serviço cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando ordens de serviço...</p>
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma ordem de serviço cadastrada ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Abertura</TableHead>
                  <TableHead>Tempo Parada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.equipamentoNome}</TableCell>
                    <TableCell>{order.tecnico}</TableCell>
                    <TableCell>
                      <Badge variant={order.tipoManutencao === 'preventiva' ? 'default' : 'secondary'}>
                        {order.tipoManutencao === 'preventiva' ? 'Preventiva' : 'Corretiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.dataAbertura.toDate().toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{order.tempoParada}h</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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