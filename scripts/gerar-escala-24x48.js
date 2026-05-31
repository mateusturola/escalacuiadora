const fs = require('fs');
const path = require('path');

const CORTE_ISO = '2026-06-01T18:00:00';
const FIM_ISO   = '2027-05-31T18:00:00';
const ROTACAO = ['Marcilene', 'Janaina', 'Lucia'];

const arquivo = path.join(__dirname, '..', 'public', 'agendamento.json');
const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));

const corte = new Date(CORTE_ISO);
const fim   = new Date(FIM_ISO);

function toIsoLocal(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function shift1hAntes(iso) {
  return iso.replace('T19:00:00', 'T18:00:00').replace('T07:00:00', 'T06:00:00');
}

const legado = [];
let truncados = 0;
let descartados = 0;
let ajustados18h = 0;
for (const p of dados.plantoes) {
  const ini = new Date(p.inicio);
  const f   = new Date(p.fim);
  if (ini >= corte) { descartados++; continue; }

  const inicioAjustado = shift1hAntes(p.inicio);
  const fimAjustado    = shift1hAntes(p.fim);
  if (inicioAjustado !== p.inicio || fimAjustado !== p.fim) ajustados18h++;

  const novaIni = new Date(inicioAjustado);
  const novoFim = new Date(fimAjustado);

  if (novoFim > corte) {
    legado.push({ ...p, inicio: inicioAjustado, fim: CORTE_ISO });
    truncados++;
  } else {
    legado.push({ ...p, inicio: inicioAjustado, fim: fimAjustado });
  }
}

const novos = [];
let t = new Date(corte);
let i = 0;
while (t < fim) {
  const fimPlantao = new Date(t.getTime() + 24 * 3600 * 1000);
  novos.push({
    inicio: toIsoLocal(t),
    fim:    toIsoLocal(fimPlantao),
    cuidadora: ROTACAO[i % ROTACAO.length],
  });
  t = fimPlantao;
  i++;
}

dados.plantoes = [...legado, ...novos].sort((a, b) => a.inicio.localeCompare(b.inicio));
fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));

console.log(`Legado: ${legado.length} (truncados: ${truncados}, descartados pós-corte: ${descartados}, ajustados p/ 18h: ${ajustados18h})`);
console.log(`Novos:  ${novos.length}`);
console.log(`Total:  ${dados.plantoes.length}`);
