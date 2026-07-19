import { Expense, Vehicle, Client } from "../types";

export const initialFixedExpenses: Expense[] = [
  { id: "fx1", name: "Aluguel Estacionamento", value: 2500, recurrence: 'Mensal', startDate: '2026-01-01' },
  { id: "fx2", name: "Salário Sara (Atendimento)", value: 2200, recurrence: 'Mensal', startDate: '2026-01-01' },
  { id: "fx3", name: "Anúncios Meta Ads", value: 30, recurrence: 'Diária', startDate: '2026-01-01' },
  { id: "fx4", name: "Lavagem Rápida Terceirizada", value: 450, recurrence: 'Semanal', startDate: '2026-01-01' },
  { id: "fx5", name: "Sistema de Gestão (ERP)", value: 300, recurrence: 'Mensal', startDate: '2026-01-01' },
  { id: "fx6", name: "Assinatura Webmotors VIP", value: 1200, recurrence: 'Mensal', startDate: '2026-02-01' },
  { id: "fx7", name: "Contabilidade", value: 800, recurrence: 'Mensal', startDate: '2026-01-01' },
  { id: "fx8", name: "Seguro do Pátio", value: 3500, recurrence: 'Anual', startDate: '2026-03-15' },
];

export const initialVehicles: Vehicle[] = [
  // 1. Veículo Recente (Julho) - Vendido Rápido
  {
    id: "v1",
    name: "Audi A3 Sedan 2.0 TFSI",
    description: "Único dono, revisões na concessionária. Carro de repasse vendido em tempo recorde.",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 85000,
    saleValue: 105000,
    status: "Vendido",
    entryDate: "2026-07-02",
    saleDate: "2026-07-10",
    expenses: [
      { id: "v1_e1", name: "Polimento Técnico", value: 450, category: "Funilaria" },
      { id: "v1_e2", name: "Anúncio Destaque Webmotors", value: 150, category: "Marketing" },
    ],
    licensePlate: "AUD-1A23",
    renavam: "11122233344",
    buyerName: "Carlos Eduardo Mendes",
    buyerDoc: "123.456.789-00",
  },
  // 2. Veículo em Estoque com Débitos
  {
    id: "v2",
    name: "Jeep Compass Longitude",
    description: "Carro com IPVA atrasado, aguardando comprador para regularizar.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 110000,
    saleValue: 135000,
    status: "Em Estoque",
    entryDate: "2026-06-15",
    expenses: [
      { id: "v2_e1", name: "Lavagem Detalhada", value: 300, category: "Mecânica" },
    ],
    licensePlate: "JEP-9B87",
    renavam: "99988877766",
    debts: [
      { id: "v2_d1", type: "IPVA", amount: 2800.00, dueDate: "2026-01-30", description: "IPVA 2026 Atrasado" },
      { id: "v2_d2", type: "Multa", amount: 130.16, dueDate: "2026-05-15", description: "Excesso de Velocidade" }
    ]
  },
  // 3. Veículo em Manutenção (Oficina)
  {
    id: "v3",
    name: "Honda Civic Touring 1.5 Turbo",
    description: "Carro chegou fazendo barulho na suspensão. Aguardando peças da concessionária.",
    image: "https://images.unsplash.com/photo-1629897148590-7d3d0f01eb06?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1629897148590-7d3d0f01eb06?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1625828557999-52219e2c6085?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 125000,
    saleValue: 148000,
    status: "Manutenção",
    entryDate: "2026-07-05",
    expenses: [
      { id: "v3_e1", name: "Guincho até a oficina", value: 250, category: "Mecânica" },
      { id: "v3_e2", name: "Amortecedores Dianteiros", value: 1800, category: "Mecânica" }
    ],
    licensePlate: "CIV-2C22",
    renavam: "55566677788"
  },
  // 4. Veículo de Baixo Custo / Alto Giro
  {
    id: "v4",
    name: "VW Fox Connect 1.6",
    description: "Excelente para motorista de aplicativo. Bastante procurado.",
    image: "https://images.unsplash.com/photo-1698226065545-c42b2ab62867?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1698226065545-c42b2ab62867?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 45000,
    saleValue: 58000,
    status: "Vendido",
    entryDate: "2026-04-10",
    saleDate: "2026-04-18",
    expenses: [
      { id: "v4_e1", name: "Troca de Óleo e Filtros", value: 350, category: "Mecânica" },
      { id: "v4_e2", name: "Higienização Interna", value: 180, category: "Funilaria" },
      { id: "v4_e3", name: "Transferência", value: 300, category: "Documentação" }
    ],
    licensePlate: "FOX-4D56",
    buyerName: "Amanda Rodrigues",
    buyerDoc: "987.654.321-11",
  },
  // 5. Veículo Premium de Alto Valor
  {
    id: "v5",
    name: "BMW X1 sDrive20i M Sport",
    description: "Configuração exclusiva, interior caramelo. Muito conservada.",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 190000,
    saleValue: 235000,
    status: "Em Estoque",
    entryDate: "2026-05-20",
    expenses: [
      { id: "v5_e1", name: "Vitrificação de Pintura", value: 1200, category: "Funilaria" },
      { id: "v5_e2", name: "Laudo Cautelar Premium", value: 450, category: "Documentação" },
      { id: "v5_e3", name: "Tráfego Pago Focado", value: 800, category: "Marketing" }
    ],
    licensePlate: "BMW-1M00",
    debts: []
  },
  // 6. Veículo Vendido com Alta Margem
  {
    id: "v6",
    name: "Toyota Hilux SRX 2.8 Diesel",
    description: "Comprada em leilão de frota, pequenos reparos feitos e vendida com margem excelente.",
    image: "https://images.unsplash.com/photo-1623813350293-85ecb1bc32c3?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1623813350293-85ecb1bc32c3?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 150000,
    saleValue: 220000,
    status: "Vendido",
    entryDate: "2026-03-01",
    saleDate: "2026-04-05",
    expenses: [
      { id: "v6_e1", name: "Reparo Pára-choque Dianteiro", value: 1500, category: "Funilaria" },
      { id: "v6_e2", name: "Pneus Novos (Jogo Misto)", value: 4800, category: "Mecânica" },
      { id: "v6_e3", name: "Despachante Leilão", value: 1200, category: "Documentação" }
    ],
    licensePlate: "HLX-4X44",
    buyerName: "Fazenda Agro Boi",
    buyerDoc: "12.345.678/0001-99"
  },
  // 7. SUV Compacto (Manutenção)
  {
    id: "v7",
    name: "Chevrolet Tracker Premier 1.2",
    description: "Teto solar panorâmico. Apresentou falha no sensor de estacionamento.",
    image: "https://images.unsplash.com/photo-1681240212354-94943fcfd3ff?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1681240212354-94943fcfd3ff?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 115000,
    saleValue: 138000,
    status: "Manutenção",
    entryDate: "2026-07-12",
    expenses: [
      { id: "v7_e1", name: "Módulo Sensor Ré", value: 650, category: "Mecânica" }
    ],
    licensePlate: "TRK-0P12"
  },
  // 8. Sedan Médio Vendido no Início do Ano
  {
    id: "v8",
    name: "Toyota Corolla XEi 2.0",
    description: "Carro de único dono, pegamos numa troca com a Hilux.",
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
    gallery: [],
    purchaseValue: 98000,
    saleValue: 115000,
    status: "Vendido",
    entryDate: "2026-01-10",
    saleDate: "2026-02-05",
    expenses: [
      { id: "v8_e1", name: "Bateria Nova", value: 550, category: "Mecânica" },
      { id: "v8_e2", name: "Taxa de Transferência", value: 250, category: "Documentação" }
    ],
    licensePlate: "COR-2L2L",
    buyerName: "Roberto Justus",
    buyerDoc: "444.555.666-77"
  },
  // 9. Hatch Popular em Estoque Sem Foto
  {
    id: "v9",
    name: "Hyundai HB20 1.0 Comfort",
    description: "Chegou agora, aguardando lavagem para tirar as fotos e anunciar.",
    image: "",
    gallery: [],
    purchaseValue: 52000,
    saleValue: 65000,
    status: "Em Estoque",
    entryDate: "2026-07-15",
    expenses: [],
    licensePlate: "HBV-2022"
  },
  // 10. Carro Esportivo
  {
    id: "v10",
    name: "Porsche 718 Cayman",
    description: "Oportunidade. Cliente deixou em consignação mas acabamos comprando para revenda.",
    image: "https://images.unsplash.com/photo-1503376712353-6447abf4b0ce?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503376712353-6447abf4b0ce?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 420000,
    saleValue: 490000,
    status: "Em Estoque",
    entryDate: "2026-06-01",
    expenses: [
      { id: "v10_e1", name: "Revisão Porsche Center", value: 4500, category: "Mecânica" },
      { id: "v10_e2", name: "Anúncios Premium", value: 1500, category: "Marketing" }
    ],
    licensePlate: "POR-7180"
  },
  {
    id: "v11",
    name: "Honda HR-V Touring 1.5 Turbo",
    description: "Versão topo de linha, teto solar, pacote Honda Sensing. Muito procurado.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
    ],
    purchaseValue: 125000,
    saleValue: 145000,
    status: "Em Estoque",
    entryDate: "2026-07-05",
    expenses: [
      { id: "v11_e1", name: "Higienização Interna", value: 350, category: "Funilaria" }
    ],
    licensePlate: "HRV-2T22"
  },
  {
    id: "v12",
    name: "Volkswagen Polo Highline 200 TSI",
    description: "Painel digital, excelente estado. Recebido como parte do pagamento.",
    image: "https://images.unsplash.com/photo-1616422285623-14bf929f2710?auto=format&fit=crop&w=800&q=80",
    gallery: [],
    purchaseValue: 78000,
    saleValue: 92000,
    status: "Manutenção",
    entryDate: "2026-07-15",
    expenses: [
      { id: "v12_e1", name: "Revisão dos 50 mil km", value: 850, category: "Mecânica" }
    ],
    licensePlate: "POL-0H20"
  }
];

export const mockClients: Client[] = [
  {
    id: "cl_1",
    name: "Roberto Silva",
    phone: "(11) 98765-4321",
    email: "roberto@email.com",
    status: "Lead",
    interest: "Honda Civic ou Corolla",
    notes: "Procura carro para família, orçamento até R$ 90.000",
    createdAt: "2026-07-10"
  },
  {
    id: "cl_2",
    name: "Amanda Costa",
    phone: "(11) 91234-5678",
    email: "amanda@email.com",
    status: "Negociando",
    interest: "Ford Ka Titanium 2019",
    notes: "Vai dar um Celta 2012 na troca",
    createdAt: "2026-07-14"
  },
  {
    id: "cl_3",
    name: "Carlos Ferreira",
    phone: "(21) 99988-7766",
    email: "carlos.f@email.com",
    status: "Cliente",
    interest: "Toyota Hilux",
    notes: "Comprou a Hilux SRV em março. Pode querer trocar no ano que vem.",
    createdAt: "2026-03-15"
  },
  {
    id: "cl_4",
    name: "Fernanda Lima",
    phone: "(31) 99887-1122",
    email: "fernanda.lima@email.com",
    status: "Lead",
    interest: "SUV Compacto (Tracker ou Renegade)",
    notes: "Só compra se tiver teto solar. Aceita consórcio.",
    createdAt: "2026-07-16"
  },
  {
    id: "cl_5",
    name: "Marcos Vinícius",
    phone: "(41) 97777-5555",
    email: "marcos.v@email.com",
    status: "Lead" as const,
    interest: "Audi A3",
    notes: "Achou o valor do Audi A3 muito alto. Manter no radar caso apareça um A3 mais antigo.",
    createdAt: "2026-06-20"
  }
];
