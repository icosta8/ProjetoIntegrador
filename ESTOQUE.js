const STORAGE_KEY = 'estoque';
const MOVIMENTACOES_KEY = 'movimentacoes';

function carregarPecasNoSelect() {
  const selectItem = document.getElementById('item');
  const pecasSalvas = JSON.parse(localStorage.getItem('pecas')) || [];

  selectItem.innerHTML = '<option value="">Selecione um item</option>';

  pecasSalvas.forEach(peca => {
    const option = document.createElement('option');
    option.value = peca.nome;
    option.textContent = peca.nome;
    selectItem.appendChild(option);
  });
}

function registrarMovimentacao(tipo) {
  const item = document.getElementById('item').value;
  const quantidade = parseInt(document.getElementById('quantity').value);
  const posicao = document.getElementById('posicao').value;
  const filial = document.getElementById('centro').value;

  if (!item || !quantidade || !posicao || !filial) {
    alert('Preencha todos os campos.');
    return;
  }

  const agora = new Date();
  const horario = agora.toLocaleString('pt-BR');

  let estoque = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const index = estoque.findIndex(p => p.nome === item && p.posicao === posicao && p.filial === filial);

  if (tipo === 'Saída') {
    if (index === -1 || estoque[index].quantidade < quantidade) {
      alert('Quantidade insuficiente ou item/posição/filial não encontrado.');
      return;
    }
    estoque[index].quantidade -= quantidade;

    if (estoque[index].quantidade === 0) {
      estoque.splice(index, 1);
    } else {
      estoque[index].horario = horario;
      estoque[index].tipo = tipo;
    }

  } else if (tipo === 'Entrada') {
    if (index === -1) {
      estoque.push({
        nome: item,
        quantidade: quantidade,
        posicao: posicao,
        filial: filial,
        tipo: tipo,
        horario: horario
      });
    } else {
      estoque[index].quantidade += quantidade;
      estoque[index].horario = horario;
      estoque[index].tipo = tipo;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(estoque));
  carregarEstoque();

  registrarMovimentacaoHistorico({
    dataHora: horario,
    item: item,
    quantidade: quantidade,
    posicao: posicao,
    filial: filial,
    status: tipo
  });

  // Limpar campos
  document.getElementById('item').value = '';
  document.getElementById('quantity').value = 1;
  document.getElementById('posicao').value = '';
  document.getElementById('centro').value = '';
}

function registrarMovimentacaoHistorico(movimentacao) {
  let movimentacoes = JSON.parse(localStorage.getItem(MOVIMENTACOES_KEY)) || [];
  movimentacoes.unshift(movimentacao); // coloca no topo
  localStorage.setItem(MOVIMENTACOES_KEY, JSON.stringify(movimentacoes));
  carregarMovimentacoes();
}

function carregarEstoque() {
  const tbody = document.getElementById('list-in-stock');
  tbody.innerHTML = '';

  const estoque = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  estoque.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.quantidade}</td>
      <td>${item.posicao}</td>
      <td>${item.filial || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function carregarMovimentacoes() {
  const tbody = document.getElementById('movimentacoes-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const movimentacoes = JSON.parse(localStorage.getItem(MOVIMENTACOES_KEY)) || [];

  movimentacoes.forEach(mov => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mov.dataHora}</td>
      <td>${mov.item}</td>
      <td>${mov.quantidade}</td>
      <td>${mov.posicao}</td>
      <td>${mov.filial}</td>
      <td>${mov.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function exportPDF() {
  const estoque = JSON.parse(localStorage.getItem('estoque')) || [];

  if (estoque.length === 0) {
    alert("O estoque está vazio.");
    return;
  }

  // Cria uma planilha
  const worksheet = XLSX.utils.json_to_sheet(estoque.map(item => ({
    Item: item.nome,
    Quantidade: item.quantidade,
    Posição: item.posicao,
    Filial: item.filial || '-'
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");

  // Converte para arrayBuffer para usar no jsPDF
  const wbout = XLSX.write(workbook, { bookType: "csv", type: "array" });
  const text = new TextDecoder().decode(wbout);
  const lines = text.split('\n');

  // Carrega jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(16);
  doc.text("Relatório de Estoque - Ferragens Negrão", 10, 10);

  // Tabela
  let y = 20;
  lines.forEach((line, index) => {
    const cols = line.split(",");
    if (cols.length > 1) {
      doc.setFontSize(10);
      doc.text(cols.join(" | "), 10, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    }
  });

  doc.save("relatorio-estoque.pdf");
}


window.addEventListener('DOMContentLoaded', () => {
  carregarPecasNoSelect();
  carregarEstoque();
  carregarMovimentacoes();
});

document.getElementById('entry-btn').addEventListener('click', () => registrarMovimentacao('Entrada'));
document.getElementById('exit-btn').addEventListener('click', () => registrarMovimentacao('Saída'));
