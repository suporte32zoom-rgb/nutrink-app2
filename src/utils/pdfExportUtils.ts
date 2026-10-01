import { Patient, MealPlan, UserAccount, ClinicalPrescription } from '../types';
import { 
  normalizeHeightToCm, 
  normalizeHeightToMeters, 
  calculateBMI, 
  calculateMifflinTMB, 
  calculateGET, 
  calculateWaterRecommendation 
} from './nutritionCalculations';
import { trackDocumentExport } from '../services/analytics';

/**
 * Generates an official, beautifully styled print window with clinic letterhead (NutrinK + Professional CRN)
 */
export function printMealPlanPdf(patient: Patient, userAccount?: UserAccount): void {
  trackDocumentExport('plano_alimentar', 'pdf');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita janelas pop-up para gerar a impressão do plano alimentar.');
    return;
  }

  // Cálculos dinâmicos em tempo real para a emissão do documento
  const heightM = normalizeHeightToMeters(patient.heightCm);
  const heightCm = normalizeHeightToCm(patient.heightCm);
  const weightKg = patient.currentWeightKg || 0;
  const bmiData = calculateBMI(weightKg, patient.heightCm);
  const tmb = calculateMifflinTMB(patient.gender, weightKg, patient.heightCm, patient.age);
  const getVal = calculateGET(tmb, patient.activityFactor || 1.2);
  const waterData = calculateWaterRecommendation(weightKg);

  const mealPlan = patient.mealPlan;
  const doctorName = userAccount?.name || 'Dr. Nutricionista';
  const doctorCrn = userAccount?.crn || 'CRN Ativo';
  const doctorSpecialty = userAccount?.specialty || 'Nutrição Clínica & Esportiva';
  const clinicName = userAccount?.clinicName || '';
  const clinicAddress = userAccount?.clinicAddress || '';
  const clinicPhone = userAccount?.phone || '';
  const clinicEmail = userAccount?.email || 'contato@nutrink.com.br';
  const prescriptionFooter = userAccount?.prescriptionFooter || '';
  const nowStr = new Date().toLocaleDateString('pt-BR');

  const mealsHtml = mealPlan?.meals && mealPlan.meals.length > 0
    ? mealPlan.meals.map(m => `
        <div class="meal-card">
          <div class="meal-header">
            <div class="meal-title">${m.time ? `${m.time} - ` : ''}${m.name}</div>
            <div class="meal-calories">${m.items.reduce((s, i) => s + i.calories, 0)} kcal</div>
          </div>
          <table class="food-table">
            <thead>
              <tr>
                <th>Alimento</th>
                <th style="width: 140px;">Porção / Medida</th>
                <th style="text-align: right; width: 80px;">Calorias</th>
                <th style="text-align: right; width: 60px;">P (g)</th>
                <th style="text-align: right; width: 60px;">C (g)</th>
                <th style="text-align: right; width: 60px;">G (g)</th>
              </tr>
            </thead>
            <tbody>
              ${m.items.map(it => `
                <tr>
                  <td><strong>${it.foodName}</strong></td>
                  <td>${it.portion}</td>
                  <td style="text-align: right;">${it.calories}</td>
                  <td style="text-align: right;">${it.protein}g</td>
                  <td style="text-align: right;">${it.carbs}g</td>
                  <td style="text-align: right;">${it.fat}g</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')
    : `<p style="padding: 20px; background: #f8fafc; border-radius: 8px; font-style: italic;">Nenhuma refeição detalhada prescrita até o momento.</p>`;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Dossiê & Parecer Clínico - ${patient.name} | NutrinK</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #9333ea;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 24px;
            font-weight: 900;
            color: #581c87;
            letter-spacing: -0.5px;
          }
          .brand span {
            color: #c026d3;
          }
          .doctor-meta {
            text-align: right;
            font-size: 12px;
            color: #475569;
          }
          .doctor-meta strong {
            color: #0f172a;
            font-size: 14px;
            display: block;
          }
          .patient-card {
            background-color: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          .patient-field {
            font-size: 11px;
            color: #6b21a8;
            font-weight: 700;
            text-transform: uppercase;
          }
          .patient-value {
            font-size: 14px;
            color: #1e1b4b;
            font-weight: 800;
            margin-top: 2px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .metric-box {
            background: #fdf4ff;
            border: 1px solid #f0abfc;
            padding: 10px 14px;
            border-radius: 8px;
            text-align: center;
          }
          .metric-val {
            font-size: 16px;
            font-weight: 900;
            color: #701a75;
          }
          .metric-lbl {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #a21caf;
            margin-top: 2px;
          }
          .macro-bar {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 18px;
            border-radius: 10px;
          }
          .macro-item {
            flex: 1;
            text-align: center;
          }
          .macro-val {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          }
          .macro-lbl {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
          }
          .meal-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            margin-bottom: 18px;
            overflow: hidden;
            page-break-inside: avoid;
          }
          .meal-header {
            background-color: #f1f5f9;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
          }
          .meal-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }
          .meal-calories {
            font-size: 12px;
            font-weight: 700;
            color: #7e22ce;
            background: #faf5ff;
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid #d8b4fe;
          }
          .food-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
          }
          .food-table th, .food-table td {
            padding: 8px 14px;
            border-bottom: 1px solid #f1f5f9;
          }
          .food-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            text-align: left;
          }
          .food-table tr:last-child td {
            border-bottom: none;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #94a3b8;
          }
          .guidelines {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 14px 18px;
            border-radius: 10px;
            margin-top: 24px;
            font-size: 12px;
            color: #92400e;
            page-break-inside: avoid;
          }
          .guidelines strong {
            color: #78350f;
            display: block;
            margin-bottom: 4px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Nutrin<span>K</span></div>
            <div style="font-size: 10px; color: #7e22ce; font-weight: bold; letter-spacing: 1px;">SISTEMA CLÍNICO & GESTÃO INTEGRADA</div>
            ${clinicName ? `<div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 4px;">${clinicName}</div>` : ''}
            ${clinicAddress ? `<div style="font-size: 11px; color: #64748b;">${clinicAddress}</div>` : ''}
          </div>
          <div class="doctor-meta">
            <strong>${doctorName}</strong>
            <div><span>${doctorCrn}</span> • <span>${doctorSpecialty}</span></div>
            ${clinicPhone ? `<div>Tel: <strong>${clinicPhone}</strong></div>` : ''}
            <div>${clinicEmail}</div>
          </div>
        </div>

        <div class="patient-card">
          <div>
            <div class="patient-field">Paciente</div>
            <div class="patient-value">${patient.name}</div>
          </div>
          <div>
            <div class="patient-field">Idade / Gênero</div>
            <div class="patient-value">${patient.age > 0 ? `${patient.age} anos` : '-'} (${patient.gender})</div>
          </div>
          <div>
            <div class="patient-field">Peso Atual / Altura</div>
            <div class="patient-value">${weightKg > 0 ? `${weightKg} kg` : '-'} • ${heightCm > 0 ? `${heightCm} cm (${heightM.toFixed(2)}m)` : '-'}</div>
          </div>
          <div>
            <div class="patient-field">Objetivo Clínico</div>
            <div class="patient-value">${patient.objective.replace('_', ' ').toUpperCase()}</div>
          </div>
        </div>

        {/* Parecer de Cálculos Metabólicos Dinâmicos */}
        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-val">${bmiData.bmi > 0 ? bmiData.bmi : '-'}</div>
            <div class="metric-lbl">IMC (${bmiData.classification !== '-' ? bmiData.classification.split(' ')[0] : 'Aguardando'})</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">${tmb > 0 ? `${tmb} kcal` : '-'}</div>
            <div class="metric-lbl">TMB (Mifflin-St Jeor)</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">${getVal > 0 ? `${getVal} kcal` : '-'}</div>
            <div class="metric-lbl">GET (NAF ${patient.activityFactor || 1.2})</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">${waterData.ml > 0 ? `${waterData.ml} mL` : '-'}</div>
            <div class="metric-lbl">Meta Hídrica (${waterData.liters > 0 ? `${waterData.liters} L/dia` : '35 mL/kg'})</div>
          </div>
        </div>

        <div class="macro-bar">
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetCalories || (getVal > 0 ? getVal : '-')} kcal</div>
            <div class="macro-lbl">Meta Energética (VET)</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetProteinGrams || (weightKg > 0 ? Math.round(weightKg * 2.0) : '-')}g</div>
            <div class="macro-lbl">Proteínas (2.0g/kg)</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetCarbsGrams || (getVal > 0 ? Math.round((getVal * 0.45) / 4) : '-')}g</div>
            <div class="macro-lbl">Carboidratos</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${mealPlan?.targetFatGrams || (getVal > 0 ? Math.round((getVal * 0.25) / 9) : '-')}g</div>
            <div class="macro-lbl">Lipídios (Gorduras)</div>
          </div>
          <div class="macro-item">
            <div class="macro-val">${waterData.liters > 0 ? `${waterData.liters} L/dia` : '-'}</div>
            <div class="macro-lbl">Meta de Hidratação</div>
          </div>
        </div>

        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Cronograma de Refeições & Prescrição</h3>
        ${mealsHtml}

        <div class="guidelines">
          <strong>💧 Orientações Gerais & Hidratação:</strong>
          • Meta Hídrica calculada: ${waterData.ml > 0 ? `${waterData.ml} mL ao dia (${waterData.liters} L)` : '35 mL por kg de peso corporal ao dia'}, distribuídos ao longo do dia.<br>
          • Mastigue devagar e priorize alimentos frescos e integrais conforme a prescrição.<br>
          • Em caso de dúvidas ou necessidade de substituições, consulte seu nutricionista através do canal oficial.
        </div>

        ${prescriptionFooter ? `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11.5px; color: #334155; line-height: 1.6;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">📌 Observações do Consultório:</strong>
          ${prescriptionFooter}
        </div>
        ` : ''}

        ${mealPlan?.digitalSignature?.signed ? `
        <div style="margin-top: 36px; border: 2px solid #059669; background: #ecfdf5; border-radius: 12px; padding: 16px 20px; page-break-inside: avoid; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: #10b981; border-radius: 50%;"></span>
                <strong style="color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Documento Assinado Eletronicamente</strong>
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${mealPlan.digitalSignature.signedBy} (${mealPlan.digitalSignature.professionalCouncil})
              </div>
              <div style="font-size: 11px; color: #047857; margin-top: 6px; line-height: 1.5;">
                <div><strong>Data e Hora:</strong> ${mealPlan.digitalSignature.signedAt}</div>
                <div><strong>Código Hash de Verificação:</strong> <code style="background: #d1fae5; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; word-break: break-all;">${mealPlan.digitalSignature.hash}</code></div>
                <div><strong>Padrão de Autenticidade:</strong> ICP-Brasil / CFN / CRM • Integridade e Não Repúdio Garantidos</div>
              </div>
            </div>
            ${mealPlan.digitalSignature.qrCodeUrl ? `
            <div style="text-align: center; flex-shrink: 0; background: #ffffff; padding: 8px; border: 1.5px solid #a7f3d0; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
              <img src="${mealPlan.digitalSignature.qrCodeUrl}" alt="QR Code de Validação" style="width: 84px; height: 84px; display: block;" />
              <span style="font-size: 8px; font-weight: 800; color: #065f46; display: block; margin-top: 4px; letter-spacing: 0.3px;">VALIDAÇÃO DIGITAL</span>
            </div>
            ` : ''}
          </div>
        </div>
        ` : `
        <div class="footer">
          <div>Documento gerado em ${nowStr} • <strong>${clinicName || 'NutrinK Consultório Inteligente'}</strong></div>
          <div>${doctorName} • ${doctorCrn} • Assinatura: ___________________________________</div>
        </div>
        `}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Builds formatted WhatsApp message text and opens WhatsApp Web/App directly
 */
export function sendMealPlanViaWhatsApp(patient: Patient, userAccount?: UserAccount): void {
  trackDocumentExport('plano_alimentar', 'whatsapp');
  const phoneDigits = (patient.phone || '').replace(/\D/g, '');
  const doctorName = userAccount?.name || 'Dr(a). Nutricionista';
  const mealPlan = patient.mealPlan;

  let text = `Olá, *${patient.name}*! Tudo bem? Aqui é do consultório de *${doctorName}*.\n\n`;
  text += `🥗 Segue o seu *Plano Alimentar NutrinK* atualizado para o objetivo de *${patient.objective.replace('_', ' ').toUpperCase()}*:\n\n`;
  text += `📊 *Metas Diárias:*\n`;
  text += `• Calorias: *${mealPlan?.targetCalories || patient.get} kcal/dia*\n`;
  text += `• Hidratação: *${patient.anamnese?.waterIntakeLiters || ((patient.currentWeightKg * 35)/1000).toFixed(1)} Litros de água/dia*\n\n`;

  if (mealPlan?.meals && mealPlan.meals.length > 0) {
    text += `🍽️ *Cronograma de Refeições:*\n\n`;
    mealPlan.meals.forEach((m) => {
      text += `*${m.time ? `${m.time} - ` : ''}${m.name}*\n`;
      m.items.forEach(it => {
        text += `  • ${it.foodName}: ${it.portion} (${it.calories} kcal)\n`;
      });
      text += `\n`;
    });
  } else {
    text += `Seu plano estruturado está ativo no prontuário eletrônico.\n\n`;
  }

  text += `Qualquer dúvida na execução ou substituições, estou à disposição!\n`;
  text += `_NutrinK • Gestão Nutricional Inteligente_`;

  const encoded = encodeURIComponent(text);
  const targetUrl = phoneDigits.length >= 10
    ? `https://wa.me/55${phoneDigits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(targetUrl, '_blank');
}

/**
 * Automatically compiles shopping list items grouped by grocery category from a meal plan
 */
export interface GroceryCategory {
  categoryName: string;
  items: { foodName: string; weeklyQuantity: string }[];
}

export function generateShoppingListFromMealPlan(patient: Patient): GroceryCategory[] {
  const mealPlan = patient.mealPlan;
  if (!mealPlan || !mealPlan.meals) return [];

  const categoryMap: { [cat: string]: { [name: string]: { count: number; portion: string } } } = {
    'Hortifrúti (Frutas, Verduras & Legumes)': {},
    'Açougue, Aves & Peixes': {},
    'Laticínios & Ovos': {},
    'Mercearia & Cereais (Arroz, Feijão, Aveia)': {},
    'Gorduras Boas, Castanhas & Sementes': {},
    'Suplementos & Especiais': {}
  };

  mealPlan.meals.forEach(m => {
    m.items.forEach(it => {
      const lower = it.foodName.toLowerCase();
      let targetCat = 'Mercearia & Cereais (Arroz, Feijão, Aveia)';

      if (lower.includes('frango') || lower.includes('carne') || lower.includes('patinho') || lower.includes('alcatra') || lower.includes('peixe') || lower.includes('tilápia') || lower.includes('salmão') || lower.includes('atum')) {
        targetCat = 'Açougue, Aves & Peixes';
      } else if (lower.includes('ovo') || lower.includes('leite') || lower.includes('queijo') || lower.includes('iogurte') || lower.includes('cottage') || lower.includes('ricota')) {
        targetCat = 'Laticínios & Ovos';
      } else if (lower.includes('banana') || lower.includes('maçã') || lower.includes('mamão') || lower.includes('morango') || lower.includes('abacaxi') || lower.includes('brócolis') || lower.includes('espinafre') || lower.includes('couve') || lower.includes('alface') || lower.includes('tomate') || lower.includes('cenoura') || lower.includes('abobrinha')) {
        targetCat = 'Hortifrúti (Frutas, Verduras & Legumes)';
      } else if (lower.includes('azeite') || lower.includes('amendoim') || lower.includes('castanha') || lower.includes('nozes') || lower.includes('chia') || lower.includes('linhaça') || lower.includes('abacate')) {
        targetCat = 'Gorduras Boas, Castanhas & Sementes';
      } else if (lower.includes('whey') || lower.includes('creatina') || lower.includes('psyllium') || lower.includes('vitamina') || lower.includes('ômega')) {
        targetCat = 'Suplementos & Especiais';
      }

      if (!categoryMap[targetCat][it.foodName]) {
        categoryMap[targetCat][it.foodName] = { count: 0, portion: it.portion };
      }
      categoryMap[targetCat][it.foodName].count += 7; // 7 days in a week
    });
  });

  const result: GroceryCategory[] = [];

  Object.entries(categoryMap).forEach(([cat, foods]) => {
    const foodList = Object.entries(foods).map(([name, data]) => {
      return {
        foodName: name,
        weeklyQuantity: `Aprox. 7 porções (${data.portion}/dia)`
      };
    });

    if (foodList.length > 0) {
      result.push({
        categoryName: cat,
        items: foodList
      });
    }
  });

  return result;
}

/**
 * Generates an official, beautifully formatted medical/nutrition prescription letterhead for printing or PDF export
 */
export function printPrescriptionPdf(patient: Patient, prescription: ClinicalPrescription, userAccount?: UserAccount): void {
  trackDocumentExport('prescricao_magistral', 'pdf');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita janelas pop-up para gerar a impressão da prescrição.');
    return;
  }

  const doctorName = userAccount?.name || 'Profissional de Saúde';
  const doctorCrn = userAccount?.crn || 'CRN / CRM Ativo';
  const doctorSpecialty = userAccount?.specialty || 'Nutrição Clínica & Funcional';
  const clinicName = userAccount?.clinicName || 'NutrinK • Consultório Virtual de Nutrição';
  const clinicAddress = userAccount?.clinicAddress || '';
  const clinicPhone = userAccount?.phone || '';
  const clinicEmail = userAccount?.email || 'contato@nutrink.com.br';
  const prescriptionFooter = userAccount?.prescriptionFooter || 'Uso exclusivo para fins dietoterápicos e de suplementação personalizada.';
  const nowStr = new Date().toLocaleDateString('pt-BR');

  const itemsHtml = prescription.items && prescription.items.length > 0
    ? prescription.items.map((it, idx) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${idx + 1}. ${it.name}</span>
            <span style="font-size: 14px; font-weight: 800; color: #7c3aed; background: #ede9fe; padding: 3px 10px; border-radius: 6px;">${it.dosage}</span>
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
            <strong>Forma:</strong> ${it.form.toUpperCase()} ${it.indication ? `• <em>${it.indication}</em>` : ''}
          </div>
          <div style="font-size: 13px; color: #1e293b; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; font-weight: 600;">
            📌 <strong>Posologia:</strong> ${it.posology}
          </div>
          ${it.notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 6px; font-style: italic;">Obs: ${it.notes}</div>` : ''}
        </div>
      `).join('')
    : '<p style="padding: 20px; font-style: italic;">Nenhum item adicionado a esta prescrição.</p>';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Prescrição Nutricional - ${prescription.title} | ${patient.name}</title>
        <style>
          @page { size: A4; margin: 1.5cm; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
            margin: 0;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #7c3aed;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .clinic-name { font-size: 20px; font-weight: 800; color: #5b21b6; }
          .doctor-name { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          .doctor-reg { font-size: 12px; color: #64748b; font-weight: 600; }
          .patient-box {
            background: #fdf4ff;
            border: 1px solid #f0abfc;
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 24px;
          }
          .rx-title {
            font-size: 18px;
            font-weight: 800;
            color: #4c1d95;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          .signature-area {
            margin-top: 50px;
            text-align: center;
          }
          .sig-line {
            width: 260px;
            border-top: 1px solid #0f172a;
            margin: 0 auto 6px auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">${clinicName}</div>
            <div class="doctor-name">${doctorName}</div>
            <div class="doctor-reg">${doctorCrn} • ${doctorSpecialty}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div><strong>Data:</strong> ${prescription.date || nowStr}</div>
            ${clinicPhone ? `<div>Tel: ${clinicPhone}</div>` : ''}
            <div>${clinicEmail}</div>
          </div>
        </div>

        <div class="patient-box">
          <div style="font-size: 15px; font-weight: 800; color: #701a75;">
            Paciente: ${patient.name}
          </div>
          <div style="font-size: 12px; color: #86198f; margin-top: 4px;">
            Idade: ${patient.age > 0 ? `${patient.age} anos` : 'A definir'} • Objetivo: ${patient.objective.replace('_', ' ').toUpperCase()} • Peso Atual: ${patient.currentWeightKg > 0 ? `${patient.currentWeightKg} kg` : '-'}
          </div>
        </div>

        <div class="rx-title">
          💊 RECEITUÁRIO NUTRICIONAL / SUPLEMENTAÇÃO: ${prescription.title}
        </div>

        ${prescription.instructions ? `
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #92400e; border-radius: 0 8px 8px 0;">
            <strong>Instruções Gerais:</strong> ${prescription.instructions}
          </div>
        ` : ''}

        <div class="items-list">
          ${itemsHtml}
        </div>

        ${prescription.digitalSignature?.signed ? `
        <div style="margin-top: 36px; border: 2px solid #059669; background: #ecfdf5; border-radius: 12px; padding: 16px 20px; page-break-inside: avoid; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: #10b981; border-radius: 50%;"></span>
                <strong style="color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Documento Assinado Eletronicamente</strong>
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${prescription.digitalSignature.signedBy} (${prescription.digitalSignature.professionalCouncil})
              </div>
              <div style="font-size: 11px; color: #047857; margin-top: 6px; line-height: 1.5;">
                <div><strong>Data e Hora:</strong> ${prescription.digitalSignature.signedAt}</div>
                <div><strong>Código Hash de Verificação:</strong> <code style="background: #d1fae5; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; word-break: break-all;">${prescription.digitalSignature.hash}</code></div>
                <div><strong>Padrão de Autenticidade:</strong> ICP-Brasil / CFN / CRM • Integridade e Não Repúdio Garantidos</div>
              </div>
            </div>
            ${prescription.digitalSignature.qrCodeUrl ? `
            <div style="text-align: center; flex-shrink: 0; background: #ffffff; padding: 8px; border: 1.5px solid #a7f3d0; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
              <img src="${prescription.digitalSignature.qrCodeUrl}" alt="QR Code de Validação" style="width: 84px; height: 84px; display: block;" />
              <span style="font-size: 8px; font-weight: 800; color: #065f46; display: block; margin-top: 4px; letter-spacing: 0.3px;">VALIDAÇÃO DIGITAL</span>
            </div>
            ` : ''}
          </div>
        </div>
        ` : `
        <div class="signature-area">
          <div class="sig-line"></div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${doctorName}</div>
          <div style="font-size: 11px; color: #64748b;">${doctorCrn} • ${doctorSpecialty}</div>
        </div>
        `}

        <div class="footer">
          <div>${prescriptionFooter}</div>
          <div style="margin-top: 4px;">Documento gerado eletronicamente via NutrinK • Sistema de Prontuário e Gestão Nutricional Integrada</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Builds formatted WhatsApp message text for prescriptions and opens WhatsApp directly
 */
export function sendPrescriptionViaWhatsApp(patient: Patient, prescription: ClinicalPrescription, userAccount?: UserAccount): void {
  trackDocumentExport('prescricao_magistral', 'whatsapp');
  const phoneDigits = (patient.phone || '').replace(/\D/g, '');
  const doctorName = userAccount?.name || 'Dr(a). Nutricionista';

  let text = `Olá, *${patient.name}*! Tudo bem? Aqui é do consultório de *${doctorName}*.\n\n`;
  text += `💊 Segue a sua *Prescrição / Protocolo de Suplementação* atualizado (*${prescription.title}*):\n\n`;

  if (prescription.instructions) {
    text += `📋 *Orientações:* ${prescription.instructions}\n\n`;
  }

  prescription.items.forEach((it, idx) => {
    text += `*${idx + 1}. ${it.name}* (${it.dosage})\n`;
    text += `• Forma: ${it.form.toUpperCase()}\n`;
    text += `• Posologia: ${it.posology}\n`;
    if (it.notes) text += `• Observação: ${it.notes}\n`;
    text += `\n`;
  });

  text += `Dúvidas sobre dosagens ou manipulação, estou à disposição!\n`;
  text += `_NutrinK • Gestão Clínica & Suplementação_`;

  const encoded = encodeURIComponent(text);
  const targetUrl = phoneDigits.length >= 10
    ? `https://wa.me/55${phoneDigits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(targetUrl, '_blank');
}

/**
 * Generates an official, beautifully formatted clinical summary PDF document (Dossiê e Prontuário do Paciente)
 * Includes: Complete Anthropometrics, Clinical History / Anamnesis, Latest Prescription, Metabolic Calculations & Evolution History.
 */
export function printClinicalSummaryPdf(patient: Patient, userAccount?: UserAccount): void {
  trackDocumentExport('resumo_clinico', 'pdf');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita janelas pop-up no navegador para gerar o resumo clínico em PDF.');
    return;
  }

  // Cálculos antropométricos e metabólicos
  const heightM = normalizeHeightToMeters(patient.heightCm);
  const heightCm = normalizeHeightToCm(patient.heightCm);
  const weightKg = patient.currentWeightKg || 0;
  const initialWeight = patient.initialWeightKg || weightKg;
  const targetWeight = patient.targetWeightKg || 0;
  const bmiData = calculateBMI(weightKg, patient.heightCm);
  const tmb = calculateMifflinTMB(patient.gender, weightKg, patient.heightCm, patient.age);
  const getVal = calculateGET(tmb, patient.activityFactor || 1.2);
  const waterData = calculateWaterRecommendation(weightKg);

  // Dados do profissional e consultório
  const doctorName = userAccount?.name || 'Dr(a). Profissional de Saúde';
  const doctorCrn = userAccount?.crn || 'CRN / CRM Ativo';
  const doctorSpecialty = userAccount?.specialty || 'Nutrição Clínica & Funcional';
  const clinicName = userAccount?.clinicName || 'NutrinK • Gestão Clínica & Inteligência Nutricional';
  const clinicAddress = userAccount?.clinicAddress || '';
  const clinicPhone = userAccount?.phone || '';
  const clinicEmail = userAccount?.email || 'contato@nutrink.com.br';
  const prescriptionFooter = userAccount?.prescriptionFooter || '';
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Obtenção da última avaliação de evolução física (se houver)
  const evolutionList = Array.isArray(patient.evolutionHistory) ? [...patient.evolutionHistory] : [];
  evolutionList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestEvolution = evolutionList.length > 0 ? evolutionList[0] : null;

  // Obtenção da última prescrição clínica
  const prescriptionsList = Array.isArray(patient.prescriptions) ? [...patient.prescriptions] : [];
  prescriptionsList.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  const latestPrescription = prescriptionsList.length > 0 ? prescriptionsList[0] : null;

  // Formatação de Hábito Intestinal
  const bowelLabels: Record<string, string> = {
    diario_normal: 'Diário e Normal (Tipo 3 ou 4 na Escala de Bristol)',
    constipado: 'Constipado / Ressecado (Intervalos > 48h)',
    diarreico: 'Diarreico / Amolecido',
    irregular: 'Irregular / Alternante'
  };
  const bowelHabitText = patient.anamnese?.bowelHabit ? (bowelLabels[patient.anamnese.bowelHabit] || patient.anamnese.bowelHabit) : 'Não informado';

  // Renderização do Bloco da Última Prescrição
  let prescriptionHtml = '';
  if (latestPrescription && latestPrescription.items && latestPrescription.items.length > 0) {
    prescriptionHtml = `
      <div class="section-card">
        <div class="section-title">
          <span>💊 Última Prescrição Ativa: ${latestPrescription.title}</span>
          <span class="badge-sub">${latestPrescription.date || dateFormatted} • ${latestPrescription.type.replace('_', ' ').toUpperCase()}</span>
        </div>
        ${latestPrescription.instructions ? `
          <div class="instruction-box">
            <strong>Instruções Gerais:</strong> ${latestPrescription.instructions}
          </div>
        ` : ''}
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25%;">Item / Suplemento</th>
              <th style="width: 15%;">Dosagem</th>
              <th style="width: 12%;">Forma</th>
              <th style="width: 28%;">Posologia Recomendada</th>
              <th style="width: 20%;">Indicação / Notas</th>
            </tr>
          </thead>
          <tbody>
            ${latestPrescription.items.map((it, idx) => `
              <tr>
                <td><strong>${idx + 1}. ${it.name}</strong></td>
                <td><span class="highlight-pill">${it.dosage}</span></td>
                <td><span style="text-transform: uppercase; font-size: 11px; font-weight: 700;">${it.form}</span></td>
                <td>${it.posology}</td>
                <td>${it.indication ? `<em>${it.indication}</em>` : (it.notes || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    prescriptionHtml = `
      <div class="section-card">
        <div class="section-title">
          <span>💊 Última Prescrição Ativa</span>
        </div>
        <p style="color: #64748b; font-size: 12px; font-style: italic; margin: 0; padding: 10px 0;">
          Nenhuma prescrição magistral ou protocolo de suplementação cadastrado para este paciente.
        </p>
      </div>
    `;
  }

  // Renderização do Histórico de Evoluções Físicas
  let evolutionHtml = '';
  if (evolutionList.length > 0) {
    evolutionHtml = `
      <div class="section-card">
        <div class="section-title">
          <span>📈 Histórico de Avaliações Antropométricas (${evolutionList.length} registro(s))</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th style="text-align: right;">Peso (kg)</th>
              <th style="text-align: right;">IMC</th>
              <th style="text-align: right;">% Gordura</th>
              <th style="text-align: right;">% M. Magra</th>
              <th style="text-align: right;">Cintura (cm)</th>
              <th style="text-align: right;">Quadril (cm)</th>
            </tr>
          </thead>
          <tbody>
            ${evolutionList.slice(0, 5).map(ev => `
              <tr>
                <td><strong>${ev.date}</strong></td>
                <td style="text-align: right; font-weight: 700;">${ev.weightKg ? `${ev.weightKg} kg` : '-'}</td>
                <td style="text-align: right;">${ev.bmi || '-'}</td>
                <td style="text-align: right;">${ev.bodyFatPercentage ? `${ev.bodyFatPercentage}%` : '-'}</td>
                <td style="text-align: right;">${ev.muscleMassPercentage ? `${ev.muscleMassPercentage}%` : '-'}</td>
                <td style="text-align: right;">${ev.waistCircumferenceCm ? `${ev.waistCircumferenceCm} cm` : '-'}</td>
                <td style="text-align: right;">${ev.hipCircumferenceCm ? `${ev.hipCircumferenceCm} cm` : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Resumo Clínico & Prontuário - ${patient.name} | NutrinK</title>
        <style>
          @page {
            size: A4;
            margin: 1.2cm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.45;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #7c3aed;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            font-size: 22px;
            font-weight: 900;
            color: #581c87;
            letter-spacing: -0.5px;
          }
          .brand span {
            color: #c026d3;
          }
          .doc-badge {
            display: inline-block;
            background: #fdf4ff;
            color: #701a75;
            border: 1px solid #f0abfc;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .doctor-meta {
            text-align: right;
            font-size: 11px;
            color: #475569;
          }
          .doctor-meta strong {
            color: #0f172a;
            font-size: 13px;
            display: block;
          }
          .patient-hero {
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            border: 1.5px solid #d8b4fe;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 16px;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 12px;
            page-break-inside: avoid;
          }
          .field-label {
            font-size: 10px;
            font-weight: 800;
            color: #6b21a8;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .field-value {
            font-size: 13px;
            font-weight: 800;
            color: #1e1b4b;
            margin-top: 1px;
          }
          .field-sub {
            font-size: 11px;
            color: #475569;
            font-weight: 500;
          }
          .section-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 14px;
            background: #fff;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 13px;
            font-weight: 800;
            color: #4c1d95;
            border-bottom: 1.5px solid #f1f5f9;
            padding-bottom: 6px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge-sub {
            font-size: 10px;
            font-weight: 700;
            color: #7e22ce;
            background: #faf5ff;
            border: 1px solid #d8b4fe;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .metric-cell {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px;
            text-align: center;
          }
          .metric-val {
            font-size: 14px;
            font-weight: 900;
            color: #0f172a;
          }
          .metric-lbl {
            font-size: 9.5px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-top: 1px;
          }
          .anamnese-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 16px;
            font-size: 11.5px;
          }
          .anamnese-item {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 6px;
            padding: 8px 10px;
          }
          .anamnese-item strong {
            display: block;
            color: #334155;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 6px;
          }
          .data-table th, .data-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #f1f5f9;
            text-align: left;
          }
          .data-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
          }
          .highlight-pill {
            background: #ede9fe;
            color: #6d28d9;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
          }
          .instruction-box {
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            padding: 6px 10px;
            font-size: 11.5px;
            color: #92400e;
            border-radius: 0 4px 4px 0;
            margin-bottom: 8px;
          }
          .signature-box {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10.5px;
            color: #64748b;
            page-break-inside: avoid;
          }
          .sig-line {
            width: 220px;
            border-top: 1px solid #0f172a;
            margin-bottom: 4px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand">Nutrin<span>K</span></div>
            <div class="doc-badge">Resumo Clínico Integrado & Prontuário</div>
            ${clinicName ? `<div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 3px;">${clinicName}</div>` : ''}
            ${clinicAddress ? `<div style="font-size: 10px; color: #64748b;">${clinicAddress}</div>` : ''}
          </div>
          <div class="doctor-meta">
            <strong>${doctorName}</strong>
            <div>${doctorCrn} • ${doctorSpecialty}</div>
            <div>${clinicEmail} ${clinicPhone ? `• Tel: ${clinicPhone}` : ''}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Emitido em: ${dateFormatted} às ${timeFormatted}</div>
          </div>
        </div>

        <!-- Identificação do Paciente -->
        <div class="patient-hero">
          <div>
            <div class="field-label">Paciente</div>
            <div class="field-value">${patient.name}</div>
            <div class="field-sub">
              ${patient.cpf ? `CPF: ${patient.cpf} • ` : ''}Tel: ${patient.phone || '-'} • E-mail: ${patient.email || '-'}
            </div>
          </div>
          <div>
            <div class="field-label">Idade / Gênero</div>
            <div class="field-value">${patient.age > 0 ? `${patient.age} anos` : '-'}</div>
            <div class="field-sub">${patient.gender ? patient.gender.toUpperCase() : '-'}</div>
          </div>
          <div>
            <div class="field-label">Objetivo Clínico</div>
            <div class="field-value" style="color: #7c3aed;">${patient.objective.replace('_', ' ').toUpperCase()}</div>
            <div class="field-sub">Status: ${patient.status === 'ativo' ? 'Ativo' : 'Em Acompanhamento'}</div>
          </div>
          <div>
            <div class="field-label">ID Prontuário</div>
            <div class="field-value" style="font-family: monospace; font-size: 11px;">#${patient.id}</div>
            <div class="field-sub">${patient.createdAt ? `Desde ${patient.createdAt}` : ''}</div>
          </div>
        </div>

        <!-- Seção 1: Antropometria & Metabolismo Atual -->
        <div class="section-card">
          <div class="section-title">
            <span>📊 Avaliação Antropométrica & Cálculos Metabólicos</span>
            <span class="badge-sub">Mifflin-St Jeor & Diretrizes SBAN</span>
          </div>

          <div class="metrics-grid">
            <div class="metric-cell">
              <div class="metric-val" style="color: #7e22ce;">${weightKg > 0 ? `${weightKg} kg` : '-'}</div>
              <div class="metric-lbl">Peso Atual</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val">${heightCm > 0 ? `${heightCm} cm` : '-'}</div>
              <div class="metric-lbl">Altura (${heightM > 0 ? `${heightM.toFixed(2)}m` : '-'})</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val" style="color: #059669;">${bmiData.bmi > 0 ? bmiData.bmi : '-'}</div>
              <div class="metric-lbl">IMC (${bmiData.classification !== '-' ? bmiData.classification.split(' ')[0] : 'Normal'})</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val">${tmb > 0 ? `${tmb} kcal` : '-'}</div>
              <div class="metric-lbl">TMB Basal</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val" style="color: #ea580c;">${getVal > 0 ? `${getVal} kcal` : '-'}</div>
              <div class="metric-lbl">GET (NAF ${patient.activityFactor || 1.2})</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div class="metric-cell">
              <div class="metric-val" style="font-size: 12px;">${patient.bodyFatPercentage ? `${patient.bodyFatPercentage}%` : (latestEvolution?.bodyFatPercentage ? `${latestEvolution.bodyFatPercentage}%` : '-')}</div>
              <div class="metric-lbl">% Gordura Corporal</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val" style="font-size: 12px;">${patient.muscleMassPercentage ? `${patient.muscleMassPercentage}%` : (latestEvolution?.muscleMassPercentage ? `${latestEvolution.muscleMassPercentage}%` : '-')}</div>
              <div class="metric-lbl">% Massa Magra</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val" style="font-size: 12px;">${initialWeight > 0 ? `${initialWeight} kg` : '-'}</div>
              <div class="metric-lbl">Peso Inicial</div>
            </div>
            <div class="metric-cell">
              <div class="metric-val" style="font-size: 12px; color: #2563eb;">${waterData.liters > 0 ? `${waterData.liters} L/dia` : '35 mL/kg'}</div>
              <div class="metric-lbl">Meta Hídrica (${waterData.ml || 0} mL)</div>
            </div>
          </div>

          ${latestEvolution?.waistCircumferenceCm || latestEvolution?.hipCircumferenceCm ? `
            <div style="margin-top: 10px; font-size: 11px; color: #475569; background: #fdf4ff; border: 1px solid #f0abfc; padding: 6px 10px; border-radius: 6px;">
              <strong>Circunferências Recentes:</strong> 
              ${latestEvolution.waistCircumferenceCm ? `Cintura: <strong>${latestEvolution.waistCircumferenceCm} cm</strong> | ` : ''}
              ${latestEvolution.hipCircumferenceCm ? `Quadril: <strong>${latestEvolution.hipCircumferenceCm} cm</strong> | ` : ''}
              ${latestEvolution.armCircumferenceCm ? `Braço: <strong>${latestEvolution.armCircumferenceCm} cm</strong> | ` : ''}
              ${latestEvolution.thighCircumferenceCm ? `Coxa: <strong>${latestEvolution.thighCircumferenceCm} cm</strong>` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Seção 2: Anamnese e Histórico Clínico -->
        <div class="section-card">
          <div class="section-title">
            <span>📋 Anamnese Clínica & Estilo de Vida</span>
          </div>
          <div class="anamnese-grid">
            <div class="anamnese-item">
              <strong>🩺 Histórico Clínico / Patologias</strong>
              ${patient.anamnese?.clinicalHistory || 'Nenhuma patologia ou comorbidade pregressa informada.'}
            </div>
            <div class="anamnese-item">
              <strong>⚠️ Alergias e Intolerâncias</strong>
              ${patient.anamnese?.foodAllergiesAndIntolerances || 'Nenhuma alergia ou intolerância alimentar relatada.'}
            </div>
            <div class="anamnese-item">
              <strong>💊 Medicamentos e Suplementos em Uso</strong>
              ${patient.anamnese?.currentMedicationsAndSupplements || 'Nenhum medicamento de uso contínuo informado.'}
            </div>
            <div class="anamnese-item">
              <strong>🍽️ Preferências & Aversões</strong>
              ${patient.anamnese?.dietaryPreferences ? `Gosta: ${patient.anamnese.dietaryPreferences}. ` : ''}
              ${patient.anamnese?.dietaryAversions ? `Aversão: ${patient.anamnese.dietaryAversions}.` : (patient.anamnese?.dietaryPreferences ? '' : 'Padrão alimentar livre.')}
            </div>
            <div class="anamnese-item">
              <strong>🚽 Hábito Intestinal</strong>
              ${bowelHabitText}
            </div>
            <div class="anamnese-item">
              <strong>🌙 Sono, Rotina & Atividade</strong>
              Sono: ${patient.anamnese?.sleepHoursPerNight ? `${patient.anamnese.sleepHoursPerNight}h/noite` : 'Não informado'} • 
              Ativ: ${patient.anamnese?.physicalActivity || 'Fator ' + (patient.activityFactor || 1.2)}
            </div>
          </div>
          ${patient.notes ? `
            <div style="margin-top: 8px; font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 6px;">
              <strong>Notas do Prontuário:</strong> ${patient.notes}
            </div>
          ` : ''}
        </div>

        <!-- Seção 3: Última Prescrição Ativa -->
        ${prescriptionHtml}

        <!-- Seção 4: Histórico de Evoluções (se houver) -->
        ${evolutionHtml}

        <!-- Rodapé e Assinatura -->
        ${latestPrescription?.digitalSignature?.signed ? `
        <div style="margin-top: 20px; border: 1.5px solid #059669; background: #ecfdf5; border-radius: 8px; padding: 10px 14px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #065f46; font-size: 11px; text-transform: uppercase;">✔ Documento Autenticado com Assinatura Digital</strong>
              <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 1px;">
                ${latestPrescription.digitalSignature.signedBy} (${latestPrescription.digitalSignature.professionalCouncil})
              </div>
              <div style="font-size: 10px; color: #047857; margin-top: 2px;">
                Assinado em ${latestPrescription.digitalSignature.signedAt} • Hash: <code style="font-family: monospace;">${latestPrescription.digitalSignature.hash}</code>
              </div>
            </div>
            ${latestPrescription.digitalSignature.qrCodeUrl ? `
              <img src="${latestPrescription.digitalSignature.qrCodeUrl}" alt="QR Code" style="width: 54px; height: 54px;" />
            ` : ''}
          </div>
        </div>
        ` : `
        <div class="signature-box">
          <div>
            <div>Documento gerado eletronicamente em <strong>${dateFormatted} às ${timeFormatted}</strong></div>
            <div>NutrinK • Sistema de Gestão e Inteligência Clínica Digital</div>
            ${prescriptionFooter ? `<div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">${prescriptionFooter}</div>` : ''}
          </div>
          <div style="text-align: center;">
            <div class="sig-line"></div>
            <strong style="color: #0f172a; font-size: 11.5px;">${doctorName}</strong>
            <div style="font-size: 10px;">${doctorCrn} • ${doctorSpecialty}</div>
          </div>
        </div>
        `}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
