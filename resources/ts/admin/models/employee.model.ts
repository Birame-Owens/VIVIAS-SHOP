export interface Employee {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  salaire: number;
  statut: 'actif' | 'inactif' | 'conge' | 'licencie';
  adresse: string;
  ville: string;
  date_naissance?: string;
  genre?: string;
  numero_securite_sociale?: string;
  photo?:  string;
  notes?: string;
  manager_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeListResponse {
  success: boolean;
  data: {
    employees: Employee[];
    pagination: Pagination;
  };
}

export interface EmployeeDetailResponse {
  success: boolean;
  data: {
    employee: EmployeeDetail;
  };
}

export interface EmployeeDetail extends Employee {
  nombre_absences: number;
  nombre_retards: number;
  dernier_conge: string;
  performance_score: number;
  contrats?: ContratEmploye[];
  absences?: Absence[];
}

export interface EmployeeStats {
  total_employees: number;
  employees_actifs: number;
  employees_en_conge: number;
  salaire_moyen: number;
  departements: number;
  nouvelles_embauches_mois: number;
  taux_absenteeisme: number;
}

export interface ContratEmploye {
  id: number;
  numero_contrat: string;
  type_contrat: string;
  date_debut: string;
  date_fin?: string;
  motif_fin?: string;
  salaire_base: number;
  avantages?: string;
}

export interface Absence {
  id: number;
  date_debut: string;
  date_fin: string;
  motif: string;
  justifiee: boolean;
  type: string;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface DashboardData {
  overview: {
    chiffre_affaires_mois: number;
    total_employees: number;
    nouveaux_employees_mois: number;
  };
  stats: EmployeeStats;
  orders?: {
    total_month: number;
    pending: number;
    confirmed: number;
    in_production: number;
    completed: number;
  };
  sales?: {
    growth_percentage: number;
    is_positive_growth: boolean;
  };
  popular_products?: Array<{
    nom: string;
    category: string;
    ventes: number;
    chiffre_affaires: number;
  }>;
  recent_activities?: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  type: 'embauche' | 'conge' | 'absence' | 'promotion' | 'modification';
  title: string;
  description: string;
  employee_id: number;
  created_at: string;
}
