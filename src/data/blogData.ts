export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'clinica' | 'receitas' | 'nutria_ia' | 'gestao' | 'nutrologia';
  categoryLabel: string;
  featuredImage: string;
  imageAlt: string;
  publishedAt: string;
  readTimeMinutes: number;
  author: {
    name: string;
    role: string;
    avatar: string;
    crmCrn?: string;
  };
  tags: string[];
  isFeatured?: boolean;
  contentHtml?: string;
  sections: {
    heading?: string;
    paragraphs: string[];
    callout?: {
      type: 'info' | 'alert' | 'protocol' | 'recipe';
      title: string;
      text: string;
    };
    quote?: string;
  }[];
  recipeDetails?: {
    prepTime: string;
    cookTime: string;
    servings: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    fiberGrams: number;
    ingredients: string[];
    instructions: string[];
    substitutions: string[];
  };
  clinicalProtocol?: {
    targetCondition: string;
    guidelinesSource: string;
    keyRecommendations: string[];
    contraindications: string[];
  };
  references: string[];
}

export const BLOG_CATEGORIES = [
  { id: 'todas', label: 'Todos os Artigos', icon: 'Sparkles' },
  { id: 'clinica', label: 'Nutrição Clínica & Protocolos', icon: 'HeartPulse' },
  { id: 'receitas', label: 'Receitas & Gastronomia Funcional', icon: 'Utensils' },
  { id: 'nutria_ia', label: 'Tecnologia & NÚTRIA IA', icon: 'Bot' },
  { id: 'gestao', label: 'Gestão de Consultório & NutrinK', icon: 'TrendingUp' },
  { id: 'nutrologia', label: 'Nutrologia & Longevidade', icon: 'Activity' }
] as const;

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  // 1. Artigo de Destaque - NÚTRIA IA
  {
    id: 'post-1',
    slug: 'nutria-ia-revolucao-inteligencia-artificial-nutricao-clinica',
    title: 'NÚTRIA IA: A Revolução da Inteligência Artificial Generativa no Consultório de Nutrição e Nutrologia',
    excerpt: 'Descubra como o copiloto clínico mais avançado da América Latina analisa prontuários complexos, calcula necessidades metabólicas e sugere planos alimentares em segundos com rigor científico.',
    category: 'nutria_ia',
    categoryLabel: 'Tecnologia & NÚTRIA IA',
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Médica nutróloga e nutricionista utilizando inteligência artificial no tablet durante consulta clínica',
    publishedAt: '2026-10-18',
    readTimeMinutes: 6,
    isFeatured: true,
    author: {
      name: 'Comitê Científico NutrinK',
      role: 'Revisão Médica & Nutricional',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'CRN-3 / CRM-SP Validação Integrada'
    },
    tags: ['NÚTRIA IA', 'Inteligência Artificial', 'Prontuário Eletrônico', 'Inovação Clínica', 'Produtividade'],
    sections: [
      {
        heading: 'O Fim da Sobrecarga Burocrática no Atendimento Nutricional',
        paragraphs: [
          'O atendimento nutricional de excelência exige tempo, atenção aos detalhes e uma profunda conexão humana. No entanto, pesquisas recentes com profissionais de saúde no Brasil apontam que nutricionistas e nutrólogos gastam mais de 45% do tempo de cada consulta digitando dados, consultando tabelas de composição de alimentos e calculando macronutrientes manualmente.',
          'Foi para devolver o tempo do profissional ao que realmente importa — o paciente — que a NÚTRIA IA foi concebida. Operando como uma copiloto de inteligência artificial de última geração, ela processa dados antropométricos, exames laboratoriais e preferências alimentares instantaneamente, fornecendo diagnósticos nutricionais embasados nas diretrizes da ESPEN, BRASPEN e SBD.'
        ],
        quote: 'A inteligência artificial não substitui o julgamento clínico do nutricionista; ela eleva sua capacidade diagnóstica e libera horas preciosas para a escuta empática.'
      },
      {
        heading: 'Arquitetura Clínica: Como a NÚTRIA IA Garante Segurança e Acurácia',
        paragraphs: [
          'Diferente de ferramentas de texto genéricas, a NÚTRIA IA foi treinada sobre uma base estrita de literatura científica nutricional, integrando a Tabela Brasileira de Composição de Alimentos (TACO), IBGE e bases internacionais como USDA.',
          'Ao receber um comando de voz ou texto como "elabore um plano alimentar hiperproteico de 2.200 kcal para paciente praticante de musculação com intolerância à lactose", a NÚTRIA calcula a distribuição precisa de macronutrientes, micronutrientes críticos e gera opções de substituição sem risco de contaminação cruzada.'
        ],
        callout: {
          type: 'info',
          title: 'Diferencial Tecnológico Exclusivo NutrinK',
          text: 'Com a NÚTRIA IA, a prescrição de fórmulas fitoterápicas e suplementos já vem com validação automática de interações fármaco-nutriente, evitando riscos iatrogênicos.'
        }
      },
      {
        heading: 'Resultados Comprovados em Consultórios Reais',
        paragraphs: [
          'Clínicas que adotaram a plataforma NutrinK com o plano Pro relatam uma redução média de 70% no tempo gasto na elaboração de cardápios semanais, permitindo aumentar a capacidade de atendimento em até 40% sem perda de qualidade ou exaustão profissional.'
        ]
      }
    ],
    references: [
      'ESPEN Guideline on clinical nutrition and hydration in geriatrics (Clinical Nutrition, 2022).',
      'Diretrizes da Sociedade Brasileira de Diabetes (SBD, 2023-2024).',
      'Artificial Intelligence in Nutritional Epidemiology and Dietary Assessment (Frontiers in Nutrition, 2023).'
    ]
  },

  // 2. Nutrição Clínica - Doença Renal Crônica (DRC)
  {
    id: 'post-2',
    slug: 'manejo-nutricional-drc-doenca-renal-cronica-protocolos-estagios-3-a-5',
    title: 'Manejo Nutricional na Doença Renal Crônica: Protocolos Atualizados para Estágios 3 a 5 Pré-Diálise',
    excerpt: 'Guia clínico aprofundado sobre controle de ingestão proteica, balanço eletrolítico de potássio e fósforo, e manutenção do estado nutricional em pacientes renais.',
    category: 'clinica',
    categoryLabel: 'Nutrição Clínica & Protocolos',
    featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Ambiente de laboratório clínico com análises de biomarcadores renais e creatinina',
    publishedAt: '2026-10-16',
    readTimeMinutes: 8,
    author: {
      name: 'Dra. Camila Vasconcelos',
      role: 'Especialista em Nutrição Renal',
      avatar: 'https://images.unsplash.com/photo-1594824813596-f64df3310f84?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'CRN-3 48.912'
    },
    tags: ['DRC', 'Nefrologia', 'Fósforo', 'Potássio', 'Dieta Hipoproteica', 'Clínica'],
    sections: [
      {
        heading: 'A Importância Crítica da Intervenção Nutricional Precoce',
        paragraphs: [
          'A Doença Renal Crônica (DRC) representa um dos maiores desafios da prática clínica contemporânea. O declínio progressivo da Taxa de Filtração Glomerular (TFG) exige ajustes dietéticos rigorosos para retardar a progressão para a terapia renal substitutiva (TRS) e prevenir a síndrome de desgaste proteico-energético (DPE).',
          'Nos estágios 3a, 3b e 4, a prescrição dietética adequada atua como ferramenta farmacológica potente, reduzindo a hiperfiltração glomerular e minimizando a sobrecarga de escórias nitrogenadas.'
        ],
        quote: 'A restrição proteica na DRC deve ser acompanhada de densidade energética suficiente (30 a 35 kcal/kg/dia) para evitar o catabolismo muscular e o desgaste proteico-energético.'
      },
      {
        heading: 'Prescrição de Proteínas e Balanço Energético',
        paragraphs: [
          'Para pacientes não diabéticos nos estágios 3 a 5 metabolicamente estáveis, a recomendação clássica preconiza 0,55 a 0,60 g de proteína/kg de peso corporal/dia, ou dieta muito hipoproteica (0,28 a 0,43 g/kg/dia) suplementada com cetoácidos e aminoácidos essenciais.',
          'Pelo menos 50% das proteínas devem ser de alto valor biológico (AVB), ou de fontes vegetais combinadas com planejamento rigoroso de aminoácidos limitantes.'
        ],
        callout: {
          type: 'protocol',
          title: 'Protocolo de Manejo de Micronutrientes (KDOQI 2020)',
          text: 'Fósforo: meta de 800 a 1.000 mg/dia, priorizando alimentos sem aditivos inorgânicos (polifosfatos). Potássio: monitoramento sérico individualizado, com técnicas de cocção por lixiviação quando K+ > 5,0 mEq/L.'
        }
      }
    ],
    clinicalProtocol: {
      targetCondition: 'Doença Renal Crônica Estágios 3 a 5 (TFG < 60 mL/min/1.73m²)',
      guidelinesSource: 'Diretrizes KDOQI Clinical Practice Guideline for Nutrition in CKD (2020 Update)',
      keyRecommendations: [
        'Aporte energético: 30-35 kcal/kg peso ideal/dia conforme faixa etária e atividade.',
        'Aporte proteico estágio 3-5 não dialítico: 0,55-0,60 g/kg/dia.',
        'Sódio: restrição a < 2.000 mg de sódio/dia (< 5g de cloreto de sódio).',
        'Vitamina D: suplementação orientada por níveis de 25(OH)D e PTH sérico.'
      ],
      contraindications: [
        'Dietas hiperproteicas (> 1,2 g/kg/dia) em pacientes pré-diálise.',
        'Uso indiscriminado de substitutos de sal à base de cloreto de potássio.'
      ]
    },
    references: [
      'KDOQI Clinical Practice Guideline for Nutrition in CKD: 2020 Update (AJKD, 2020).',
      'Diretrizes Brasileiras de Doença Renal Crônica (Jornal Brasileiro de Nefrologia, 2022).',
      'Maroni BJ, et al. Nutritional management of chronic renal failure. Lancet, 2021.'
    ]
  },

  // 3. Receita Saudável & Gastronomia Funcional
  {
    id: 'post-3',
    slug: 'bowl-funcional-quinoa-salmao-selvagem-abacate-molho-citrico',
    title: 'Bowl Funcional de Quinoa Real com Salmão Crocante, Abacate e Molho Cítrico de Gengibre',
    excerpt: 'Uma refeição completa, rica em ômega-3 marinho, fibras prebióticas e antioxidantes naturais. Baixo índice glicêmico e naturalmente livre de glúten.',
    category: 'receitas',
    categoryLabel: 'Receitas Saudáveis & Gastronomia Funcional',
    featuredImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Bowl colorido e saudável com salmão grelhado, quinoa, abacate fresco, folhas verdes e sementes',
    publishedAt: '2026-10-15',
    readTimeMinutes: 5,
    author: {
      name: 'Chef Letícia Mello',
      role: 'Gastronomia Funcional & Nutrição Esportiva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'CRN-3 52.109'
    },
    tags: ['Gastronomia Funcional', 'Sem Glúten', 'Ômega-3', 'Low Glycemic', 'Almoço Saudável'],
    sections: [
      {
        heading: 'Sinergia Nutricional e Ação Anti-inflamatória Sistêmica',
        paragraphs: [
          'Este bowl foi formulado para unir alta densidade nutritiva com praticidade culinária. A combinação de ácidos graxos poli-insaturados da série ômega-3 (EPA e DHA) do salmão com as gorduras monoinsaturadas do abacate atua diretamente na modulação de vias inflamatórias e na saúde cardiovascular.',
          'A quinoa real fornece todos os aminoácidos essenciais com baixo impacto glicêmico, sustentando saciedade prolongada e fornecendo magnésio bioativo para suporte neuromuscular.'
        ]
      }
    ],
    recipeDetails: {
      prepTime: '15 minutos',
      cookTime: '15 minutos',
      servings: '2 porções generosas',
      calories: 520,
      proteinGrams: 38,
      carbsGrams: 36,
      fatsGrams: 24,
      fiberGrams: 9,
      ingredients: [
        '300g de filé de salmão fresco cortado em cubos',
        '1 xícara de quinoa real em grãos cozida em caldo de legumes caseiro',
        '1 abacate tipo avocado médio fatiado',
        '1 pepino japonês finamente laminado',
        '1 xícara de edamame cozido no vapor (opcional para aporte proteico extra)',
        '2 colheres de sopa de sementes de gergelim preto e branco tostadas',
        '1 xícara de folhas verdes jovens (rúcula selvagem e espinafre baby)',
        'Para o molho: 2 colheres de sopa de azeite extravirgem, suco de 1 limão siciliano, 1 colher de chá de gengibre fresco ralado, 1 colher de chá de cúrcuma em pó e flor de sal a gosto.'
      ],
      instructions: [
        'Cozinhe a quinoa em fogo baixo por 12 minutos até os grãos abrirem e ficarem al dente. Reserve para esfriar.',
        'Aqueça uma frigideira antiaderente de fundo triplo com um fio leve de azeite. Doure os cubos de salmão com sal marinho e pimenta preta moída por 2 minutos de cada lado até criar uma crosta dourada e o centro permanecer macio.',
        'Em um bowl grande, posicione a cama de folhas verdes e distribua a quinoa cozida em uma das metades.',
        'Disponha os cubos de salmão grelhado, as fatias de abacate fresco, o pepino laminado e o edamame.',
        'Emulsione os ingredientes do molho cítrico com um garfo e regue uniformemente sobre o bowl.',
        'Finalize com o gergelim tostado e sirva imediatamente.'
      ],
      substitutions: [
        'Para pacientes vegetarianos/veganos: substitua o salmão por 250g de tofu firme marinado com páprica defumada e shoyu de coco, ou grão-de-bico crocante assado.',
        'Para intolerância a sementes: omita o gergelim e finalize com brotos de alfafa ou coentro fresco.'
      ]
    },
    references: [
      'Calder PC. Omega-3 fatty acids and inflammatory processes: from molecules to man. Biochem Soc Trans, 2022.',
      'Tabela Brasileira de Composição de Alimentos (TACO), UNICAMP, 4ª edição.'
    ]
  },

  // 4. Protocolo Clínico - SIBO e Low-FODMAP
  {
    id: 'post-4',
    slug: 'protocolo-sibo-disbiose-dieta-low-fodmap-reintroducao',
    title: 'Supercrescimento Bacteriano no Intestino Delgado (SIBO): O Passo a Passo da Dieta Low-FODMAP',
    excerpt: 'Como estruturar as fases de restrição, reintrodução e manutenção, evitando carências nutricionais e restabelecendo o conforto digestivo do paciente.',
    category: 'clinica',
    categoryLabel: 'Nutrição Clínica & Protocolos',
    featuredImage: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Alimentos frescos, ervas medicinais e frutas organizadas para protocolo digestivo Low-FODMAP',
    publishedAt: '2026-10-12',
    readTimeMinutes: 7,
    author: {
      name: 'Dr. Roberto Albuquerque',
      role: 'Médico Nutrólogo & Gastroenterologia Clínica',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'CRM-SP 142.308 / RQE 78.411'
    },
    tags: ['SIBO', 'Low-FODMAP', 'Gastroenterologia', 'Microbiota', 'Digestão'],
    sections: [
      {
        heading: 'Fisiopatologia do SIBO e Fermentação Precoce',
        paragraphs: [
          'O Supercrescimento Bacteriano no Intestino Delgado (SIBO) é caracterizado pela presença anormal de colônias bacterianas no intestino delgado que normalmente colonizam o cólon. A fermentação bacteriana precoce de carboidratos de cadeia curta provoca meteorismo intenso, dor abdominal, distensão pós-prandial e diarreia ou constipação crônica.',
          'O tratamento multidisciplinar envolve tanto a abordagem médica quanto a modulação dietética precisa através do protocolo de carboidratos pouco absorvíveis (FODMAPs).'
        ],
        quote: 'A dieta Low-FODMAP não é uma dieta para a vida toda. Trata-se de uma intervenção diagnóstica e terapêutica estruturada em três fases estritas.'
      },
      {
        heading: 'As Três Fases Fundamentais do Protocolo Monash',
        paragraphs: [
          'Fase 1 (Eliminação: 2 a 6 semanas): Restrição de alimentos ricos em Fruto-oligossacarídeos, Galacto-oligossacarídeos, Lactose, Frutose em excesso e Polióis (sorbitol, manitol, xilitol).',
          'Fase 2 (Reintrodução Guiada): Testes controlados por grupo específico de carboidrato ao longo de 3 dias consecutivos para identificar gatilhos individuais de hipersensibilidade visceral.',
          'Fase 3 (Personalização e Manutenção): Flexibilização da dieta mantendo a maior diversidade alimentar possível para preservar a microbiota sacarolítica protetora do cólon.'
        ],
        callout: {
          type: 'alert',
          title: 'Alerta Clínico Fundamental',
          text: 'Restrições prolongadas da dieta Low-FODMAP além de 8 semanas reduzem significativamente a contagem de bifidobactérias benéficas intestinais. A reintrodução metódica é obrigatória.'
        }
      }
    ],
    references: [
      'Monash University FODMAP Diet Guidelines (Gastroenterology, 2021).',
      'Pimentel M, et al. ACG Clinical Guideline: Small Intestinal Bacterial Overgrowth. Am J Gastroenterol, 2020.',
      'Staudacher HM, Whelan K. The low FODMAP diet: recent advances in understanding its mechanisms and efficacy in IBS. Gut, 2022.'
    ]
  },

  // 5. Gestão de Consultório & NutrinK
  {
    id: 'post-5',
    slug: 'guia-gestao-consultorio-nutricao-escala-precificacao-retencao',
    title: 'Guia de Alta Performance: Gestão, Precificação e Retenção de Pacientes para Nutricionistas',
    excerpt: 'Estratégias práticas para transformar seu consultório em uma clínica rentável, reduzindo no-shows, organizando o fluxo de caixa e fidelizando pacientes a longo prazo.',
    category: 'gestao',
    categoryLabel: 'Gestão de Consultório & NutrinK',
    featuredImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Consultório moderno de nutrição com recepção acolhedora e equipamentos tecnológicos de avaliação',
    publishedAt: '2026-10-10',
    readTimeMinutes: 6,
    author: {
      name: 'Lucas Brandão',
      role: 'Especialista em Gestão de Saúde & Growth NutrinK',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'NutrinK Practice Management'
    },
    tags: ['Gestão', 'Consultório', 'Finanças', 'Fidelização', 'NutrinK'],
    sections: [
      {
        heading: 'Por Que Mais de 60% dos Consultórios Falham nos Primeiros 2 Anos?',
        paragraphs: [
          'A formação técnica em nutrição e nutrologia é rigorosa no aspecto biológico e metabólico, mas costuma negligenciar a formação em gestão financeira, precificação e experiência do paciente. O resultado é a armadilha comum do "consultório dependente de consultas avulsas".',
          'Profissionais que atingem faturamento mensal consistente acima de R$ 15.000 operam seus consultórios com modelos de acompanhamento contínuo, previsibilidade de receita e automação de rotinas administrativas.'
        ],
        quote: 'Paciente não compra plano alimentar em PDF; paciente investe em um processo de transformação contínua e acompanhamento próximo.'
      },
      {
        heading: 'Os 4 Pilares da Gestão Eficiente no NutrinK',
        paragraphs: [
          '1. Prontuário Único e Acesso Ágil: Centralizar antropometria, exames, histórico alimentar e mensagens em uma única tela elimina a perda de dados e projeta extremo profissionalismo.',
          '2. Telemedicina Integrada: Consultas híbridas presenciais e online aumentam em 35% a adesão de pacientes com rotinas atribuladas.',
          '3. Controle de Estoque e Insumos: Para clínicas que fornecem suplementos, kits de bioimpedância ou manipulados no local, o controle de lote e validade evita perdas financeiras.',
          '4. Faturamento Automatizado via Pix e Cartão: Cobrança facilitada reduz a inadimplência a índices inferiores a 2%.'
        ]
      }
    ],
    references: [
      'CFN - Conselho Federal de Nutricionistas: Resolução sobre Teleconsulta e Prontuário Digital.',
      'Harvard Business Review: Customer Retention in Healthcare Practices (2023).'
    ]
  },

  // 6. Receita Saudável - Pão Low-Carb
  {
    id: 'post-6',
    slug: 'pao-low-carb-farinha-amendoas-psyllium-sem-gluten',
    title: 'Pão Rústico Low-Carb de Amêndoas e Psyllium: Maciez Perfeita Sem Glúten e Sem Lactose',
    excerpt: 'Uma receita testada clinicamente para pacientes diabéticos e adeptos de alimentação cetogênica ou low-carb, rica em fibras solúveis que modulam a resposta insulínica.',
    category: 'receitas',
    categoryLabel: 'Receitas Saudáveis & Gastronomia Funcional',
    featuredImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Pão rústico artesanal fatiado em tábua de madeira com sementes e miolo fofinho',
    publishedAt: '2026-10-08',
    readTimeMinutes: 5,
    author: {
      name: 'Chef Letícia Mello',
      role: 'Gastronomia Funcional & Nutrição Esportiva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'CRN-3 52.109'
    },
    tags: ['Low-Carb', 'Sem Glúten', 'Diabetes', 'Fibras', 'Café da Manhã'],
    sections: [
      {
        heading: 'O Papel do Psyllium na Textura e no Índice Glicêmico',
        paragraphs: [
          'A casca da semente de Plantago ovata (psyllium) é uma fonte extraordinária de fibras hidrossolúveis formadoras de gel. Ao entrar em contato com água morna, ela replica a viscoelasticidade do glúten, permitindo que massas feitas exclusivamente com farinhas de oleaginosas fiquem aeradas e macias.',
          'Além disso, o gel de psyllium retarda o esvaziamento gástrico e a absorção intestinal de glicose, resultando em curvas glicêmicas pós-prandiais suaves e sem picos de insulina.'
        ]
      }
    ],
    recipeDetails: {
      prepTime: '15 minutos',
      cookTime: '45 minutos',
      servings: '12 fatias',
      calories: 145,
      proteinGrams: 6,
      carbsGrams: 3, // Net carbs
      fatsGrams: 11,
      fiberGrams: 7,
      ingredients: [
        '200g de farinha de amêndoas fina e pura',
        '45g de psyllium em pó (husk moído fino)',
        '1 colher de sopa de fermento químico em pó sem alumínio',
        '1 colher de chá de sal marinho iodado',
        '3 claras de ovos orgânicos em temperatura ambiente',
        '2 ovos inteiros médios',
        '2 colheres de sopa de vinagre de maçã orgânico não pasteurizado',
        '200ml de água fervente (essencial para ativar o gel de psyllium)',
        'Sementes de abóbora e girassol para decorar o topo.'
      ],
      instructions: [
        'Preaqueça o forno a 180°C e unte uma forma de pão inglês com azeite ou papel vegetal.',
        'Em uma tigela ampla, misture a farinha de amêndoas, o psyllium em pó, o fermento e o sal.',
        'Adicione os ovos inteiros, as claras e o vinagre de maçã. Misture com espátula até formar uma massa densa e homogênea.',
        'Despeje a água fervente de uma só vez sobre a massa. Misture vigorosamente com fouet ou batedeira por 1 minuto. A massa vai expandir e ganhar consistência elástica conforme o psyllium hidrata.',
        'Modele a massa no formato de pão na forma preparada. Faça cortes superficiais no topo e polvilhe as sementes.',
        'Asse por 45 a 50 minutos até a casca ficar dourada e crocante. Ao espetar um palito, deve sair seco.',
        'Deixe esfriar completamente sobre uma grade antes de fatiar para a estrutura interna assentar.'
      ],
      substitutions: [
        'Para reduzir custo: use 100g de farinha de semente de girassol finamente moída combinada com 100g de farinha de amêndoas.',
        'Para sabor enriquecido: adicione 1 colher de chá de alecrim fresco picado ou orégano seco na massa.'
      ]
    },
    references: [
      'Gibb RD, et al. Psyllium fiber improves glycemic control proportional to loss of glycemic control. Am J Clin Nutr, 2021.',
      'USDA FoodData Central Nutritional Database.'
    ]
  },

  // 7. Nutrologia & Longevidade
  {
    id: 'post-7',
    slug: 'estrategias-nutricionais-remissao-diabetes-tipo-2',
    title: 'Remissão do Diabetes Mellitus Tipo 2: Estratégias Nutricionais Baseadas em Restrição Energética e Redução de Carboidratos',
    excerpt: 'Evidências do estudo DiRECT e protocolos práticos de esteatose pancreática, sensibilidade à insulina e monitoramento glicêmico contínuo.',
    category: 'nutrologia',
    categoryLabel: 'Nutrologia & Longevidade',
    featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Glicosímetro digital moderno e alimentos com baixo impacto glicêmico em mesa clínica',
    publishedAt: '2026-10-05',
    readTimeMinutes: 7,
    author: {
      name: 'Dr. Roberto Albuquerque',
      role: 'Médico Nutrólogo & Gastroenterologia Clínica',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
      crmCrn: 'CRM-SP 142.308 / RQE 78.411'
    },
    tags: ['Diabetes Tipo 2', 'Remissão', 'Insulina', 'Nutrologia', 'Longevidade'],
    sections: [
      {
        heading: 'O Novo Paradigma da Remissão do DM2',
        paragraphs: [
          'Historicamente considerado uma condição progressiva e irreversível, o Diabetes Tipo 2 passou por uma redefinição profunda a partir dos ensaios clínicos DiRECT (Diabetes Remission Clinical Trial). A perda de peso intencional de 10 a 15 kg foi capaz de reverter a esteatose hepática e pancreática, restabelecendo a secreção bifásica de insulina em até 86% dos indivíduos diagnosticados há menos de 6 anos.',
          'O papel do nutrólogo e do nutricionista é estruturar um plano alimentar que maximize o déficit calórico sem comprometer a massa magra esquelética.'
        ]
      }
    ],
    references: [
      'Lean ME, et al. Primary care-led weight management for remission of type 2 diabetes (DiRECT): an open-label, cluster-randomised trial. Lancet, 2018; 2020.',
      'American Diabetes Association (ADA) Standards of Care in Diabetes, 2024.'
    ]
  }
];
