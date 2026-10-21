import { Patient, Appointment, FinancialTransaction, FoodItem, ClinicalProtocol } from '../types';

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  { id: 'f1', name: 'Peito de Frango Grelhado', category: 'Proteínas', portion: '100g', portionGrams: 100, calories: 159, protein: 32.0, carbs: 0, fat: 2.5, fiber: 0 },
  { id: 'f2', name: 'Ovo de Galinha Inteiro Cozido', category: 'Proteínas', portion: '1 unidade (50g)', portionGrams: 50, calories: 78, protein: 6.5, carbs: 0.6, fat: 5.3, fiber: 0 },
  { id: 'f3', name: 'Whey Protein Concentrado 80%', category: 'Suplementos', portion: '1 dosador (30g)', portionGrams: 30, calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 0 },
  { id: 'f4', name: 'Salmão Grelhado', category: 'Proteínas', portion: '100g', portionGrams: 100, calories: 206, protein: 22.0, carbs: 0, fat: 12.3, fiber: 0 },
  { id: 'f5', name: 'Tofu Firme Orgânico', category: 'Proteínas', portion: '100g', portionGrams: 100, calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { id: 'f6', name: 'Arroz Integral Cozido', category: 'Carboidratos', portion: '100g (3 colheres de sopa)', portionGrams: 100, calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7 },
  { id: 'f7', name: 'Feijão Carioca Cozido', category: 'Leguminosas', portion: '1 concha (100g)', portionGrams: 100, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5 },
  { id: 'f8', name: 'Batata Doce Cozida', category: 'Carboidratos', portion: '100g', portionGrams: 100, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
  { id: 'f9', name: 'Aveia em Flocos Finos', category: 'Cereais', portion: '30g (2 colheres de sopa)', portionGrams: 30, calories: 118, protein: 4.2, carbs: 20.0, fat: 2.1, fiber: 3.0 },
  { id: 'f10', name: 'Banana Prata', category: 'Frutas', portion: '1 unidade média (70g)', portionGrams: 70, calories: 69, protein: 0.9, carbs: 18.2, fat: 0.1, fiber: 1.4 },
  { id: 'f11', name: 'Maçã Gala com Casca', category: 'Frutas', portion: '1 unidade média (130g)', portionGrams: 130, calories: 77, protein: 0.4, carbs: 20.0, fat: 0.2, fiber: 2.6 },
  { id: 'f12', name: 'Azeite de Oliva Extra Virgem', category: 'Gorduras Boas', portion: '1 colher de sopa (10ml)', portionGrams: 10, calories: 88, protein: 0, carbs: 0, fat: 10.0, fiber: 0 },
  { id: 'f13', name: 'Pasta de Amendoim Integral', category: 'Gorduras Boas', portion: '1 colher de sopa (15g)', portionGrams: 15, calories: 92, protein: 4.0, carbs: 3.0, fat: 7.5, fiber: 1.2 },
  { id: 'f14', name: 'Castanha-do-Pará (Brasil)', category: 'Oleaginosas', portion: '2 unidades (10g)', portionGrams: 10, calories: 65, protein: 1.4, carbs: 1.2, fat: 6.6, fiber: 0.8 },
  { id: 'f15', name: 'Iogurte Natural Desnatado', category: 'Laticínios', portion: '1 pote (160g)', portionGrams: 160, calories: 66, protein: 6.4, carbs: 9.6, fat: 0.2, fiber: 0 },
  { id: 'f16', name: 'Queijo Cottage', category: 'Laticínios', portion: '50g (2 colheres de sopa)', portionGrams: 50, calories: 49, protein: 6.2, carbs: 1.7, fat: 1.8, fiber: 0 },
  { id: 'f17', name: 'Brócolis Cozido no Vapor', category: 'Vegetais', portion: '100g (1 xícara)', portionGrams: 100, calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'f18', name: 'Espinafre Refogado', category: 'Vegetais', portion: '100g', portionGrams: 100, calories: 42, protein: 2.9, carbs: 3.8, fat: 1.8, fiber: 2.2 },
  { id: 'f19', name: 'Chia em Grãos', category: 'Sementes', portion: '1 colher de sobremesa (10g)', portionGrams: 10, calories: 49, protein: 1.7, carbs: 4.2, fat: 3.1, fiber: 3.4 },
  { id: 'f20', name: 'Abacate Hass', category: 'Gorduras Boas', portion: '50g', portionGrams: 50, calories: 80, protein: 1.0, carbs: 4.3, fat: 7.3, fiber: 3.4 }
];

import { Patient, Appointment, FinancialTransaction, FoodItem, ClinicalProtocol, InventoryItem } from '../types';

export const EXAMPLE_PATIENT: Patient = {
  id: 'paciente-exemplo-demo',
  name: 'Mariana Duarte Alencar',
  cpf: '123.456.789-00',
  email: 'mariana.alencar@exemplo.com.br',
  phone: '(11) 98765-4321',
  birthDate: '1992-05-14',
  age: 33,
  gender: 'feminino',
  objective: 'emagrecimento',
  initialWeightKg: 68.0,
  currentWeightKg: 64.5,
  targetWeightKg: 60.0,
  heightCm: 168,
  bmi: 22.9,
  bodyFatPercentage: 21.5,
  muscleMassPercentage: 34.2,
  activityFactor: 1.55,
  tmb: 1395,
  get: 2162,
  anamnese: {
    clinicalHistory: 'Paciente relata fadiga após almoço e distensão abdominal. Sem histórico de cirurgias.',
    foodAllergiesAndIntolerances: 'Intolerância moderada à lactose e sensibilidade a excesso de glúten.',
    dietaryPreferences: 'Prefere preparações caseiras, frutas vermelhas, salmão, ovos mexidos e café com canela.',
    dietaryAversions: 'Refrigerantes e frituras.',
    routineAndOccupation: 'Arquiteta, trabalha híbrido 3x na semana no escritório e 2x em home office.',
    bowelHabit: 'diario_normal',
    sleepHoursPerNight: 7,
    waterIntakeLiters: 2.2,
    physicalActivity: 'Musculação 4x/semana e corrida leve aos sábados.',
    alcoholConsumption: 'social',
    smoking: false,
    currentMedicationsAndSupplements: 'Creatina 5g/dia, Vitamina D 2.000 UI e Probiótico intestinal.',
    emotionalRelationshipWithFood: 'Boa relação, mas busca praticidade no preparo das marmitas da semana.'
  },
  mealPlan: {
    id: 'plano-mariana-01',
    title: 'Plano Nutricional de Densidade Alta & Modulação Intestinal',
    dateCreated: '2026-10-18',
    targetCalories: 1850,
    targetProteinGrams: 125,
    targetCarbsGrams: 180,
    targetFatGrams: 55,
    targetFiberGrams: 32,
    hydrationGoalLiters: 2.5,
    supplements: ['Creatina Monoidratada 5g', 'Ômega-3 1000mg EPA/DHA', 'Glutamina 5g'],
    meals: [
      {
        id: 'm1',
        name: 'Café da Manhã Energético',
        time: '07:30',
        items: [
          { id: 'mi1', foodName: 'Ovos mexidos com azeite de oliva', portion: '2 unidades', calories: 180, protein: 13, carbs: 1, fat: 14, fiber: 0 },
          { id: 'mi2', foodName: 'Pão 100% integral ou de aveia', portion: '1 fatia (40g)', calories: 95, protein: 4, carbs: 18, fat: 1, fiber: 3 },
          { id: 'mi3', foodName: 'Mamão papaia com chia', portion: '1/2 unidade + 1 col sopa', calories: 110, protein: 3, carbs: 18, fat: 4, fiber: 5 }
        ]
      },
      {
        id: 'm2',
        name: 'Almoço Funcional',
        time: '12:30',
        items: [
          { id: 'mi4', foodName: 'Filé de Frango Grelhado', portion: '130g', calories: 210, protein: 41, carbs: 0, fat: 3, fiber: 0 },
          { id: 'mi5', foodName: 'Arroz Integral com Cúrcuma', portion: '4 colheres de sopa (120g)', calories: 150, protein: 3, carbs: 31, fat: 1, fiber: 3 },
          { id: 'mi6', foodName: 'Feijão Carioca', portion: '1 concha média (100g)', calories: 76, protein: 5, carbs: 14, fat: 0.5, fiber: 8.5 },
          { id: 'mi7', foodName: 'Salada de Folhas Verdes, Cenoura e Tomate', portion: 'À vontade com 1 col sopa de azeite', calories: 95, protein: 1, carbs: 4, fat: 9, fiber: 3 }
        ]
      },
      {
        id: 'm3',
        name: 'Lanche da Tarde Pré-Treino',
        time: '16:30',
        items: [
          { id: 'mi8', foodName: 'Iogurte Natural Lac-Free ou Vegetal', portion: '1 pote (160g)', calories: 90, protein: 8, carbs: 10, fat: 2, fiber: 0 },
          { id: 'mi9', foodName: 'Whey Protein Isolado', portion: '1 scoop (25g)', calories: 100, protein: 22, carbs: 1, fat: 0.5, fiber: 0 },
          { id: 'mi10', foodName: 'Morangos frescos', portion: '1 xícara (100g)', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 }
        ]
      },
      {
        id: 'm4',
        name: 'Jantar Leve & Reconfortante',
        time: '20:00',
        items: [
          { id: 'mi11', foodName: 'Salmão Assado com Ervas', portion: '120g', calories: 247, protein: 26, carbs: 0, fat: 15, fiber: 0 },
          { id: 'mi12', foodName: 'Batata Doce Assada', portion: '100g', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3 },
          { id: 'mi13', foodName: 'Brócolis e Abobrinha no Vapor', portion: '1 prato raso', calories: 45, protein: 3, carbs: 8, fat: 0.5, fiber: 4 }
        ]
      }
    ]
  },
  prescriptions: [],
  evolutionHistory: [
    {
      id: 'evo-1',
      date: '2026-08-10',
      weightKg: 68.0,
      heightCm: 168,
      bmi: 24.1,
      bodyFatPercentage: 24.5,
      muscleMassPercentage: 32.0,
      notes: 'Consulta inicial. Traçado objetivo de redução de gordura visceral e melhora da energia.'
    },
    {
      id: 'evo-2',
      date: '2026-09-15',
      weightKg: 66.2,
      heightCm: 168,
      bmi: 23.5,
      bodyFatPercentage: 23.0,
      muscleMassPercentage: 33.1,
      notes: 'Retorno 35 dias. Excelente adesão alimentar, redução de circunferência de cintura (-3cm).'
    },
    {
      id: 'evo-3',
      date: '2026-10-18',
      weightKg: 64.5,
      heightCm: 168,
      bmi: 22.9,
      bodyFatPercentage: 21.5,
      muscleMassPercentage: 34.2,
      notes: 'Manutenção da massa magra e diminuição progressiva do percentual de gordura. Paciente muito satisfeita.'
    }
  ],
  labExams: [],
  notes: 'Paciente exemplo pré-cadastrada para degustação interativa do consultório NutrinK.',
  status: 'ativo',
  createdAt: '2026-10-15',
  tags: ['Exemplo Clínico', 'Modulação Intestinal', 'Composição Corporal']
};

export const INITIAL_PATIENTS: Patient[] = [EXAMPLE_PATIENT];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-fita-metrica',
    name: 'Fita Métrica Antropométrica Retrátil (Cescorf)',
    category: 'equipamento',
    categoryLabel: 'Equipamentos & Avaliação',
    subcategory: 'Antropometria',
    currentStock: 4,
    minStock: 2,
    unit: 'unidade',
    unitLabel: 'Unidades',
    location: 'Gabinete 1 - Gaveta Superior',
    costPrice: 42.0,
    salePrice: 75.0,
    supplier: 'Cescorf Equipamentos Médicos',
    notes: 'Com trava automática e ponteira para aferição precisa de perímetros.',
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10'
  },
  {
    id: 'inv-bio-eletrodos',
    name: 'Eletrodos para Bioimpedância Tetrapolar (Pacote c/ 100)',
    category: 'insumo',
    categoryLabel: 'Insumos Clínicos',
    subcategory: 'Bioimpedância',
    currentStock: 12,
    minStock: 5,
    unit: 'caixa',
    unitLabel: 'Caixas',
    lotNumber: 'BIO-2026-A12',
    expirationDate: '2027-12-31',
    location: 'Armário Clínico - Prateleira 2',
    costPrice: 85.0,
    salePrice: 130.0,
    supplier: 'BioHealth Distribuidora',
    notes: 'Eletrodos descartáveis de prata/cloreto de prata com gel condutor.',
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10'
  },
  {
    id: 'inv-whey-isolado',
    name: 'Whey Protein Isolado 90% Baunilha (Pote 900g)',
    category: 'suplemento',
    categoryLabel: 'Suplementos & Amostras',
    subcategory: 'Proteínas',
    currentStock: 8,
    minStock: 3,
    unit: 'frasco',
    unitLabel: 'Potes',
    lotNumber: 'WPI-9844-B',
    expirationDate: '2027-08-30',
    location: 'Estoque Suplementação - Armário B',
    costPrice: 140.0,
    salePrice: 220.0,
    supplier: 'NutriSupplements Lab',
    notes: 'Para revenda e demonstração aos pacientes do consultório.',
    createdAt: '2026-10-12',
    updatedAt: '2026-10-12'
  },
  {
    id: 'inv-omega3-tg',
    name: 'Ômega-3 TG Ultra Concentrado 1000mg EPA/DHA (60 caps)',
    category: 'suplemento',
    categoryLabel: 'Suplementos & Amostras',
    subcategory: 'Lipídios Funcionais',
    currentStock: 15,
    minStock: 5,
    unit: 'frasco',
    unitLabel: 'Frascos',
    lotNumber: 'OMG-2026-99',
    expirationDate: '2028-01-15',
    location: 'Estoque Suplementação - Armário B',
    costPrice: 65.0,
    salePrice: 110.0,
    supplier: 'NutriSupplements Lab',
    notes: 'Certificação IFOS 5 estrelas livre de metais pesados.',
    createdAt: '2026-10-12',
    updatedAt: '2026-10-12'
  }
];

export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: 'proto-hipertrofia',
    name: 'Hipertrofia Muscular & Otimização da Síntese Proteica (MPS)',
    category: 'Nutrição Esportiva',
    indication: 'Praticantes de musculação e atletas visando ganho de massa livre de gordura.',
    targetKcalStrategy: 'Superávit calórico controlado (+250 a +500 kcal/dia acima do GET).',
    proteinRangeGPerKg: '1.8 a 2.4 g/kg de peso corporal fracionados a cada 3-4 horas.',
    carbsRangePercentage: '45% a 55% do VET (4.0 a 7.0 g/kg).',
    fatRangePercentage: '20% a 30% do VET (0.8 a 1.2 g/kg).',
    keyNutrients: ['Leucina (3g por refeição)', 'Creatina Monoidratada (0.05g/kg/dia)', 'Vitamina D3', 'Zinco Quelato', 'Ômega 3'],
    recommendedFoods: ['Peito de frango', 'Ovos inteiros', 'Salmão', 'Arroz integral/branco', 'Aveia', 'Batata doce', 'Azeite de oliva', 'Frutas vermelhas'],
    foodsToLimit: ['Gorduras trans hidrogenadas', 'Álcool em excesso', 'Açúcares refinados ultraprocessados'],
    clinicalObservations: 'Monitorar ganho de peso a uma taxa de 0.25% a 0.5% do peso corporal por semana para minimizar acúmulo de gordura.'
  },
  {
    id: 'proto-emagrecimento',
    name: 'Emagrecimento com Preservação de Massa Magra',
    category: 'Composição Corporal',
    indication: 'Pacientes com sobrepeso ou obesidade, ou em fase de definição muscular.',
    targetKcalStrategy: 'Déficit calórico moderado (-300 a -600 kcal/dia do GET).',
    proteinRangeGPerKg: '2.0 a 2.6 g/kg de peso (manter balanço nitrogenado positivo durante o déficit).',
    carbsRangePercentage: '30% a 45% do VET (priorizar carboidratos de baixo índice glicêmico e alto teor de fibras).',
    fatRangePercentage: '25% a 30% do VET (foco em ácidos graxos monoinsaturados e poli-insaturados).',
    keyNutrients: ['Fibras solúveis (30-40g/dia)', 'Psyllium', 'Magnésio', 'Cálcio', 'Água (40ml/kg)'],
    recommendedFoods: ['Vegetais folhosos verde-escuros', 'Leguminosas', 'Proteínas magras', 'Frutas de baixa carga glicêmica (morango, mirtilo, maçã)', 'Sementes de chia'],
    foodsToLimit: ['Bebidas açucaradas', 'Frituras', 'Doces concentrados', 'Snacks ultraprocessados'],
    clinicalObservations: 'Manter treinamento resistido para estímulo mecanotransdutivo e proteção muscular.'
  },
  {
    id: 'proto-diabetes-dm2',
    name: 'Manejo Clínico do Diabetes Tipo 2 & Resistência Insulínica',
    category: 'Nutrição Clínica & Endocrinologia',
    indication: 'Pacientes com pré-diabetes, DM2, esteatose hepática ou síndrome metabólica.',
    targetKcalStrategy: 'Eucalórica ou leve déficit calórico para melhora da sensibilidade à insulina.',
    proteinRangeGPerKg: '1.4 a 1.8 g/kg.',
    carbsRangePercentage: '30% a 40% do VET (Low GI/GL, ricos em beta-glucanas e amido resistente).',
    fatRangePercentage: '30% a 38% do VET (predominância de MUFAs do azeite, abacate e oleaginosas).',
    keyNutrients: ['Cromo picolinato', 'Berberina / Ácido Alfa-Lipóico (quando indicado)', 'Magnésio Quelato', 'Vitamina D'],
    recommendedFoods: ['Azeite de oliva extravirgem', 'Aveia em flocos', 'Canela do Ceilão', 'Sementes de linhaça moída', 'Peixes ricos em EPA/DHA', 'Brócolis e crucíferas'],
    foodsToLimit: ['Farinhas brancas refinadas', 'Sucos de frutas coados', 'Doces', 'Gorduras saturadas animais em excesso'],
    clinicalObservations: 'Orientar o consumo de saladas e proteínas antes dos carboidratos nas refeições para atenuar pico pós-prandial de glicose.'
  },
  {
    id: 'proto-fodmaps',
    name: 'Protocolo Low FODMAPs para Síndrome do Intestino Irritável (SII)',
    category: 'Saúde Intestinal & Gastroenterologia',
    indication: 'Pacientes com queixas de distensão abdominal frequente, gases, dor e fezes irregulares.',
    targetKcalStrategy: 'Atendimento às necessidades energéticas basais sem restrição calórica agressiva.',
    proteinRangeGPerKg: '1.2 a 1.6 g/kg.',
    carbsRangePercentage: '45% a 55% com exclusão temporária de carboidratos fermentáveis de cadeia curta.',
    fatRangePercentage: '25% a 30%.',
    keyNutrients: ['L-Glutamina', 'Zinco carnosina', 'Enzimas digestivas específicas', 'Probióticos selecionados na fase de reintrodução'],
    recommendedFoods: ['Arroz', 'Quinoa', 'Banana prata madura', 'Cenoura', 'Abobrinha', 'Ovos', 'Carnes frescas sem marinadas com alho/cebola'],
    foodsToLimit: ['Alho', 'Cebola', 'Trigo em excesso', 'Maçã', 'Leite com lactose', 'Mel', 'Leguminosas não demolhadas'],
    clinicalObservations: 'Fase de eliminação restrita por 2 a 6 semanas, seguida por fase de reintrodução estruturada por grupos de alimentos.'
  },
  {
    id: 'proto-vegetariano',
    name: 'Nutrição Vegetariana e Vegana de Alta Densidade Nutricional',
    category: 'Dietas Plant-Based',
    indication: 'Pacientes vegetarianos ou veganos em busca de adequação de micronutrientes e composição corporal.',
    targetKcalStrategy: 'Alinhado ao objetivo (hipertrofia, manutenção ou emagrecimento).',
    proteinRangeGPerKg: '1.6 a 2.2 g/kg (compensando escore DIAAS com combinação de leguminosas + cereais).',
    carbsRangePercentage: '50% a 60% do VET.',
    fatRangePercentage: '20% a 28% do VET.',
    keyNutrients: ['Vitamina B12 (suplementação obrigatória em veganos)', 'Ferro Não-Heme + Vitamina C', 'Zinco', 'Cálcio', 'Iodo', 'Ômega 3 DHA algal'],
    recommendedFoods: ['Tofu', 'Tempeh', 'Lentilha', 'Grão de bico', 'Edamame', 'Castanhas do Brasil', 'Sementes de cânhamo e chia', 'Levedura nutricional enriquecida'],
    foodsToLimit: ['Embutidos veganos ultraprocessados', 'Açúcares simples', 'Óleos refinados'],
    clinicalObservations: 'Sempre prescrever fontes de vitamina C (limão, laranja, pimentão) junto às principais refeições para potencializar a absorção do ferro vegetal.'
  }
];
