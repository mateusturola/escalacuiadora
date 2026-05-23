const data = require('./public/agendamento.json');
const plantoes = data.plantoes.filter(p => {
  const inicio = new Date(p.inicio);
  return inicio.getMonth() === 1 && inicio.getFullYear() === 2026;
});

console.log('=== PLANTÕES DE FEVEREIRO 2026 ===\n');

const porCuidadora = {};
plantoes.forEach(p => {
  if (!porCuidadora[p.cuidadora]) porCuidadora[p.cuidadora] = [];
  porCuidadora[p.cuidadora].push(p);
});

Object.keys(porCuidadora).sort().forEach(nome => {
  const ps = porCuidadora[nome];
  const totalHoras = ps.reduce((acc, p) => {
    const inicio = new Date(p.inicio);
    const fim = new Date(p.fim);
    return acc + (fim - inicio) / (1000 * 60 * 60);
  }, 0);
  
  const plantoes19h = ps.filter(p => new Date(p.inicio).getHours() === 19).length;
  const plantoes7h = ps.filter(p => new Date(p.inicio).getHours() === 7).length;
  
  console.log(nome + ':');
  console.log('  Total: ' + ps.length + ' plantões (' + totalHoras.toFixed(0) + 'h)');
  console.log('  Noturno (19h): ' + plantoes19h);
  console.log('  Diurno (7h): ' + plantoes7h);
  console.log('');
});
