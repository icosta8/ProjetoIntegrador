
    const logData = localStorage.getItem('logData');
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<ul>${logData}</ul>`, 'text/html');
    const items = doc.querySelectorAll('li');
 
    const dateMap = {}, productMap = {}, actionMap = { 'Adicionado': 0, 'Removido': 0 };
    let totalQtd = 0;
 
    items.forEach(item => {
      const text = item.textContent;
      const match = text.match(/(\d{2}\/\d{2}\/\d{4}).+ - (.+?): (Adicionado|Removido) (\d+)/);
      if (match) {
        const [_, date, product, action, qty] = match;
        const q = parseInt(qty);
 
        // Gráfico de linha (por data)
        dateMap[date] = (dateMap[date] || 0) + 1;
 
        // Gráfico de barras (por produto)
        productMap[product] = (productMap[product] || 0) + q;
 
        // Gráfico de pizza (por tipo)
        actionMap[action] += q;
 
        totalQtd += q;
      }
    });
 
    document.getElementById('totalMov').textContent = items.length;
    document.getElementById('totalQtd').textContent = totalQtd;
 
    const dateLabels = Object.keys(dateMap);
    const dateValues = Object.values(dateMap);
 
    const prodLabels = Object.keys(productMap);
    const prodValues = Object.values(productMap);
 
    const pieLabels = Object.keys(actionMap);
    const pieValues = Object.values(actionMap);
 
    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [{
          label: 'Movimentações',
          data: dateValues,
          borderColor: 'blue',
          fill: false
        }]
      }
    });
 
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: prodLabels,
        datasets: [{
          label: 'Quantidade',
          data: prodValues,
          backgroundColor: '#007bff'
        }]
      }
    });
 
    new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieValues,
          backgroundColor: ['#17a2b8', '#dc3545']
        }]
      }
    });
 
    // Exporta como PDF
    async function exportPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
 
      doc.text('Relatório de Estoque', 10, 10);
      doc.text(`Total de movimentações: ${items.length}`, 10, 20);
      doc.text(`Quantidade total movimentada: ${totalQtd}`, 10, 30);
 
      doc.text('Produtos:', 10, 45);
      let y = 55;
      prodLabels.forEach((label, i) => {
        doc.text(`${label}: ${prodValues[i]} unidades`, 10, y);
        y += 10;
      });
 
      doc.save('relatorio-estoque.pdf');
    }
