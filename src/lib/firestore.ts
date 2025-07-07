import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// Tipos de dados
export interface Company {
  id: string;
  nome: string;
  emailGestor: string;
  plano: string;
  createdAt: Timestamp;
}

export interface Equipment {
  id: string;
  empresaId: string;
  nome: string;
  local: string;
  tipoManutencao: 'preventiva' | 'corretiva';
  dataInstalacao: Timestamp;
  createdAt: Timestamp;
}

export interface WorkOrder {
  id: string;
  empresaId: string;
  equipamentoId: string;
  equipamentoNome: string;
  tecnico: string;
  cpfTecnico: string;
  dataAbertura: Timestamp;
  dataConclusao?: Timestamp;
  tipoManutencao: 'preventiva' | 'corretiva';
  tempoParada: number; // em horas
  status: 'aberta' | 'executando' | 'concluida' | 'cancelada';
  observacoes?: string;
  createdAt: Timestamp;
}

// Serviços para Empresas
export const companyService = {
  async getByEmail(email: string): Promise<Company | null> {
    const q = query(collection(db, "empresas"), where("emailGestor", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Company;
  },

  async create(companyData: Omit<Company, 'id' | 'createdAt'>): Promise<string> {
    console.log("Tentando criar empresa:", companyData);
    try {
      const docRef = await addDoc(collection(db, "empresas"), {
        ...companyData,
        createdAt: Timestamp.now()
      });
      console.log("Empresa criada com sucesso, ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Erro detalhado ao criar empresa:", error);
      throw error;
    }
  }
};

// Serviços para Equipamentos
export const equipmentService = {
  async getByCompany(empresaId: string): Promise<Equipment[]> {
    const q = query(
      collection(db, "equipamentos"), 
      where("empresaId", "==", empresaId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipment[];
  },

  async create(equipmentData: Omit<Equipment, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, "equipamentos"), {
      ...equipmentData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async update(id: string, equipmentData: Partial<Equipment>): Promise<void> {
    const docRef = doc(db, "equipamentos", id);
    await updateDoc(docRef, equipmentData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, "equipamentos", id);
    await deleteDoc(docRef);
  }
};

// Serviços para Ordens de Serviço
export const workOrderService = {
  async getByCompany(empresaId: string): Promise<WorkOrder[]> {
    const q = query(
      collection(db, "ordens"), 
      where("empresaId", "==", empresaId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkOrder[];
  },

  async create(orderData: Omit<WorkOrder, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, "ordens"), {
      ...orderData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async update(id: string, orderData: Partial<WorkOrder>): Promise<void> {
    const docRef = doc(db, "ordens", id);
    await updateDoc(docRef, orderData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, "ordens", id);
    await deleteDoc(docRef);
  }
};