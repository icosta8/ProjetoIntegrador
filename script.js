console.log('JavaScript carregado com sucesso!');
 
const login = "adm";
const senha = "123";
 
function validar_login(){
    login_digitado = document.getElementById('username').value
    senha_digitado = document.getElementById('password').value
 
    if (login_digitado == login && senha_digitado == senha){
        console.log("Login correto")


    // redireciona para pagina principal
    window.location.href = "menu.html";

    
    }
    else {
        console.log("Login incorreto")
        alert("Login ou/e Senha incorreto(s)!")
    }
}
 
 
 
