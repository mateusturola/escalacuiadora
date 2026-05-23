const fs = require('fs');

// Ler o arquivo de agendamento
const agendamento = JSON.parse(fs.readFileSync('public/agendamento.json', 'utf8'));

// Função para criar data sem considerar fuso horário
function criarData(ano, mes, dia, hora) {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(hora).padStart(2, '0')}:00:00`;
}

// Função para adicionar horas a uma data string
function adicionarHoras(dataStr, horas) {
  const data = new Date(dataStr + 'Z'); // Z para UTC
  data.setUTCHours(data.getUTCHours() + horas);
  return data.toISOString().slice(0, -5);
}

// Recriar todos os plantões com o padrão correto: sempre 19h-07h (36h), alternando as cuidadoras
const cuidadoras = ['Rosario', 'Sandra'];
const novosPlantoes = [];

// Data de início: 14 de fevereiro de 2026 às 19:00
let ano = 2026;
let mes = 2;
let dia = 14;
let cuidadoraIndex = 0;

// Gerar plantões até o final do ano (213 plantões)
for (let i = 0; i < 213; i++) {
  const inicio = criarData(ano, mes, dia, 19);
  const fim = adicionarHoras(inicio, 36);
  
  novosPlantoes.push({
    inicio: inicio,
    fim: fim,
    cuidadora: cuidadoras[cuidadoraIndex]
  });
  
  // Próximo plantão começa 48h depois (36h trabalhando + 12h de intervalo)
  // Ou seja, sempre às 19h
  dia += 2;
  
  // Ajustar mês se necessário
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia > diasNoMes) {
    dia -= diasNoMes;
    mes++;
    if (mes > 12) {
      mes = 1;
      ano++;
    }
  }
  
  // Alternar cuidadora
  cuidadoraIndex = (cuidadoraIndex + 1) % cuidadoras.length;
}

// Atualizar o agendamento
agendamento.plantoes = novosPlantoes;

// Salvar o arquivo atualizado
fs.writeFileSync('public/agendamento.json', JSON.stringify(agendamento, null, 2));

console.log('✅ Horários ajustados! Agora ambas as cuidadoras trabalham das 19h às 07h (36h).');
console.log(`📅 Total de plantões gerados: ${novosPlantoes.length}`);
console.log('\n🔍 Primeiros 8 plantões:');
novosPlantoes.slice(0, 8).forEach((p, i) => {
  console.log(`${i+1}. ${p.cuidadora}: ${p.inicio} → ${p.fim}`);
});
