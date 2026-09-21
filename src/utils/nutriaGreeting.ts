export interface UserWithName {
  name?: string | null;
}

/**
 * Identifica o nome e gênero do profissional logado no sistema e formata a saudação oficial:
 * "Olá, [Dr./Dra.] [Nome do Profissional]! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?"
 */
export function getNutriaGreeting(user?: UserWithName | null): string {
  if (!user || !user.name || !user.name.trim()) {
    return 'Olá, Dr(a)! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?';
  }

  const rawName = user.name.trim();

  // 1. Se já contiver prefixo explícito de título médico/nutrição
  if (/^(dra\.?|doutora)\s+/i.test(rawName)) {
    const cleanName = rawName.replace(/^(dra\.?|doutora)\s+/i, '').trim();
    return `Olá, Dra. ${cleanName}! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
  }
  
  if (/^(dr\.?|doutor)\s+/i.test(rawName)) {
    const cleanName = rawName.replace(/^(dr\.?|doutor)\s+/i, '').trim();
    return `Olá, Dr. ${cleanName}! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
  }

  // 2. Identifica o gênero com base no primeiro nome
  const firstName = rawName.split(' ')[0].trim().toLowerCase();

  const femaleNames = new Set([
    'ana', 'maria', 'mariana', 'marina', 'camila', 'larissa', 'juliana', 'patricia',
    'patrícia', 'fernanda', 'carla', 'paula', 'leticia', 'letícia', 'beatriz', 'gabriela',
    'amanda', 'aline', 'jessica', 'jessica', 'jessica', 'bruna', 'carolina', 'luana',
    'renata', 'vanessa', 'daniela', 'bianca', 'isabela', 'isabella', 'natalia', 'natália',
    'raquel', 'claudia', 'cláudia', 'debora', 'débora', 'tatiana', 'thais', 'thaís',
    'helena', 'clarice', 'elisangela', 'elisângela', 'simone', 'monica', 'mônica',
    'vivian', 'viviane', 'luciana', 'elaine', 'alice', 'elisa', 'luiza', 'luísa',
    'valentina', 'sophia', 'sofia', 'manuela', 'manuella', 'isadora', 'livia', 'lívia',
    'laura', 'lorena', 'cecilia', 'cecília', 'yasmin', 'yasmim', 'rebeca', 'marta',
    'silvia', 'sílvia', 'clara', 'flavia', 'flávia', 'joana', 'tereza', 'teresa',
    'adriana', 'cristina', 'lorena', 'milena', 'barbara', 'bárbara', 'taina', 'tainá'
  ]);

  const maleExceptions = new Set([
    'luca', 'lucas', 'jean', 'alexandre', 'andre', 'andré', 'felipe', 'guilherme', 'jorge',
    'jose', 'josé', 'henrique', 'davi', 'david', 'cauã', 'cauan', 'gabriel', 'rafael',
    'samuel', 'daniel', 'miguel', 'heitor', 'arthur', 'artur', 'bernardo', 'theo', 'théo',
    'tarciano', 'marcos', 'marcelo', 'paulo', 'pedro', 'gustavo', 'rodrigo', 'diego',
    'mateus', 'matheus', 'bruno', 'tiago', 'thiago', 'carlos', 'eduardo', 'leonardo',
    'caio', 'vitor', 'victor', 'joao', 'joão', 'luis', 'luís', 'luiz'
  ]);

  let title = 'Dr.';
  if (femaleNames.has(firstName)) {
    title = 'Dra.';
  } else if (maleExceptions.has(firstName)) {
    title = 'Dr.';
  } else if (firstName.endsWith('a') && !maleExceptions.has(firstName)) {
    title = 'Dra.';
  } else {
    title = 'Dr.';
  }

  return `Olá, ${title} ${rawName}! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
}
