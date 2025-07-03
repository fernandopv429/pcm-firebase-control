import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { equipmentService, Equipment } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface EquipmentModuleProps {
  empresaId: string;
}

export const EquipmentModule = ({ empresaId }: EquipmentModuleProps) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    local: "",
    tipoManutencao: "preventiva" as "preventiva" | "corretiva",
    dataInstalacao: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadEquipments();
  }, [empresaId]);

  const loadEquipments = async () => {
    try {
      setLoading(true);
      const data = await equipmentService.getByCompany(empresaId);
      setEquipments(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os equipamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const equipmentData = {
        empresaId,
        nome: formData.nome,
        local: formData.local,
        tipoManutencao: formData.tipoManutencao,
        dataInstalacao: Timestamp.fromDate(new Date(formData.dataInstalacao))
      };

      if (editingEquipment) {
        await equipmentService.update(editingEquipment.id, equipmentData);
        toast({
          title: "Sucesso",
          description: "Equipamento atualizado com sucesso!",
        });
      } else {
        await equipmentService.create(equipmentData);
        toast({
          title: "Sucesso",
          description: "Equipamento cadastrado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingEquipment(null);
      setFormData({
        nome: "",
        local: "",
        tipoManutencao: "preventiva",
        dataInstalacao: new Date().toISOString().split('T')[0]
      });
      loadEquipments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o equipamento",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      nome: equipment.nome,
      local: equipment.local,
      tipoManutencao: equipment.tipoManutencao,
      dataInstalacao: equipment.dataInstalacao.toDate().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este equipamento?")) {
      try {
        await equipmentService.delete(id);
        toast({
          title: "Sucesso",
          description: "Equipamento excluído com sucesso!",
        });
        loadEquipments();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o equipamento",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Equipamentos</h2>
          <p className="text-muted-foreground">Gerencie os equipamentos da sua empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do equipamento
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Equipamento</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Compressor Principal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Localização</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Ex: Setor A - Linha 1"
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
                <Label htmlFor="dataInstalacao">Data de Instalação</Label>
                <Input
                  id="dataInstalacao"
                  type="date"
                  value={formData.dataInstalacao}
                  onChange={(e) => setFormData({ ...formData, dataInstalacao: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingEquipment ? "Atualizar" : "Cadastrar"}
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
          <CardTitle>Lista de Equipamentos</CardTitle>
          <CardDescription>
            {equipments.length} equipamento(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando equipamentos...</p>
            </div>
          ) : equipments.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum equipamento cadastrado ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Instalação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.nome}</TableCell>
                    <TableCell>{equipment.local}</TableCell>
                    <TableCell>
                      <Badge variant={equipment.tipoManutencao === 'preventiva' ? 'default' : 'secondary'}>
                        {equipment.tipoManutencao === 'preventiva' ? 'Preventiva' : 'Corretiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {equipment.dataInstalacao.toDate().toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(equipment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(equipment.id)}
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