function cadastrarPeca(event) {
    event.preventDefault();
 
    const nome = document.getElementById('nome').value;
    const categoria = document.getElementById('categoria').value;
 
    const peca = {
        nome: nome,
        categoria: categoria,
    };
 
    console.log('Peça cadastrada:', peca);
 
    let pecasSalvas = JSON.parse(localStorage.getItem('pecas')) || [];
    pecasSalvas.push(peca);
    localStorage.setItem('pecas', JSON.stringify(pecasSalvas));
 
    document.getElementById('FormularioCadastro').reset();
 
    alert("Peça cadastrada!")
    
    carregarPecasNoSelect();
}
 
document.getElementById('FormularioCadastro').addEventListener('submit', cadastrarPeca)