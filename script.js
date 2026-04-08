const personagens = {
  1: {
    nome: "Ester",
    imagem: "ester.png",
    dicas: [
      "Vivi em um palácio",
      "Tive medo, mas fui corajosa",
      "Arrisquei minha vida pelo meu povo"
    ],
    versiculo: "Ester 4:14"
  },
  2: {
    nome: "Rute",
    imagem: "rute.png",
    dicas: [
      "Deixei minha terra",
      "Escolhi permanecer fiel",
      "Recomecei do zero"
    ],
    versiculo: "Rute 1:16"
  },
  3: {
    nome: "Ana",
    imagem: "ana.png",
    dicas: [
      "Sofri por muito tempo",
      "Derramei meu coração diante de Deus",
      "Fui respondida"
    ],
    versiculo: "1 Samuel 1:27"
  },
  4: {
    nome: "Débora",
    imagem: "debora.png",
    dicas: [
      "Fui líder",
      "Julguei Israel",
      "Encorajei outros"
    ],
    versiculo: "Juízes 4:14"
  },
  5: {
    nome: "Marta",
    imagem: "marta.png",
    dicas: [
      "Eu cuidava da casa",
      "Fiquei sobrecarregada",
      "Precisei aprender prioridades"
    ],
    versiculo: "Lucas 10:41"
  },
  6: {
    nome: "Maria, mãe de Jesus",
    imagem: "maria.png",
    dicas: [
      "Fui escolhida por Deus para uma missão especial",
      "Disse 'sim' mesmo sem entender tudo",
      "Guardei as promessas no coração"
    ],
    versiculo: "Lucas 1:38"
  }
};

const desafios = [
  "Faça uma entrevista com a personagem",
  "Dê 3 conselhos para hoje",
  "Crie uma cena da vida moderna"
];

// 🔥 pega o grupo corretamente (com número)
const params = new URLSearchParams(window.location.search);
const grupo = parseInt(params.get("grupo")) || 1;
const p = personagens[grupo];

// 🧠 DEBUG (pode apagar depois)
console.log("grupo:", grupo);
console.log("personagem:", p);

// ✅ DICAS
if (document.getElementById("dicas") && p) {
  document.getElementById("dicas").innerText = p.dicas.join(" | ");
}

// ✅ VERIFICAR RESPOSTA
function verificar() {
  const resposta = document.getElementById("resposta").value;

  if (resposta.toLowerCase().includes(p.nome.toLowerCase())) {
    window.location.href = "personagem.html?grupo=" + grupo;
  } else {
    alert("Tente novamente 😊");
  }
}

// ✅ DADOS DO PERSONAGEM
if (document.getElementById("nome") && p) {
  document.getElementById("nome").innerText = p.nome;
  document.getElementById("versiculo").innerText = p.versiculo;
}

// ✅ DESAFIO
function gerarDesafio() {
  const random = Math.floor(Math.random() * desafios.length);
  document.getElementById("desafio").innerText = desafios[random];
}

// ✅ IMAGEM (COM PROTEÇÃO)
if (document.getElementById("imagem") && p && p.imagem) {
  document.getElementById("imagem").src = "assets/personagens/" + p.imagem;
}