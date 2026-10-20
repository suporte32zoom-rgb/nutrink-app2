export interface UserWithName {
  name?: string | null;
}

/**
 * Retorna o prefixo temporal dinâmico de acordo com o horário real:
 * - 05:00 às 11:59: "Bom dia"
 * - 12:00 às 17:59: "Boa tarde"
 * - 18:00 às 04:59: "Boa noite"
 * - Caso a hora não esteja disponível: "Olá"
 */
export function getTemporalGreetingPrefix(date: Date = new Date()): string {
  try {
    const hourStr = date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      hour12: false
    });
    const hour = parseInt(hourStr, 10);
    if (isNaN(hour)) {
      const localHour = date.getHours();
      if (isNaN(localHour)) return 'Olá';
      if (localHour >= 5 && localHour < 12) return 'Bom dia';
      if (localHour >= 12 && localHour < 18) return 'Boa tarde';
      return 'Boa noite';
    }
    if (hour >= 5 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  } catch {
    const localHour = date.getHours();
    if (localHour >= 5 && localHour < 12) return 'Bom dia';
    if (localHour >= 12 && localHour < 18) return 'Boa tarde';
    if (localHour >= 18 || localHour < 5) return 'Boa noite';
    return 'Olá';
  }
}

/**
 * Identifica o nome e gênero do profissional logado no sistema e formata a saudação oficial temporal:
 * Ex: "Bom dia, Dr. Tarciano! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?"
 */
export function getNutriaGreeting(user?: UserWithName | null, date: Date = new Date()): string {
  const prefix = getTemporalGreetingPrefix(date);

  if (!user || !user.name || !user.name.trim()) {
    return `${prefix}, Dr(a)! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
  }

  const rawName = user.name.trim();

  // 1. Se já contiver prefixo explícito de título médico/nutrição
  if (/^(dra\.?|doutora)\s+/i.test(rawName)) {
    const cleanName = rawName.replace(/^(dra\.?|doutora)\s+/i, '').trim();
    return `${prefix}, Dra. ${cleanName}! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
  }
  
  if (/^(dr\.?|doutor)\s+/i.test(rawName)) {
    const cleanName = rawName.replace(/^(dr\.?|doutor)\s+/i, '').trim();
    return `${prefix}, Dr. ${cleanName}! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
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

  return `${prefix}, ${title} ${rawName}! Sou a NÚTRIA, sua copiloto clínica. Como posso te ajudar hoje?`;
}
