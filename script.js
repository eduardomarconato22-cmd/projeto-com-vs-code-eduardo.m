// Estado inicial do jogador
let estado = {
    vida: 100,
    mana: 50,
    ouro: 20,
    inventario: ["Poção de Vida", "Mapa Antigo"],
    somAtivo: false
};

// Áudio sintetizado simples via Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarSom(frequencia, tipo = "sine", duracao = 0.15) {
    if (!estado.somAtivo) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(frequencia, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracao);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duracao);
}

function alternarSom() {
    estado.somAtivo = !estado.somAtivo;
    document.getElementById("btn-som").textContent = estado.somAtivo ? "🔊 Som: On" : "🔇 Som: Off";
    if (estado.somAtivo) tocarSom(520, "triangle", 0.2);
}

// Roteiro da aventura
const cenas = {
    inicio: {
        titulo: "A Encruzilhada da Névoa",
        texto: "Você está diante das ruínas de Eldoria. A névoa cobre a estrada de pedra. À esquerda, uma fogueira revela um mercador encapuzado. À direita, uma trilha desce para a Floresta Sussurrante.",
        opcoes: [
            { texto: "Falar com o mercador encapuzado", destino: "mercador" },
            { texto: "Entrar na Floresta Sussurrante", destino: "floresta" }
        ]
    },
    mercador: {
        titulo: "O Mercador Errante",
        texto: "'Saudações, viajante! O caminho até o Cristal exige preparo. Posso lhe vender um Códice Arcano por 15 moedas de ouro.'",
        opcoes: [
            {
                texto: "Comprar Códice Arcano (15 Ouro)",
                destino: "mercador_comprou",
                condicao: () => estado.ouro >= 15 && !estado.inventario.includes("Códice Arcano"),
                acao: () => {
                    estado.ouro -= 15;
                    estado.inventario.push("Códice Arcano");
                    tocarSom(660, "sine", 0.2);
                }
            },
            { texto: "Seguir para a Floresta Sussurrante", destino: "floresta" },
            { texto: "Voltar à encruzilhada", destino: "inicio" }
        ]
    },
    mercador_comprou: {
        titulo: "Negócio Fechado",
        texto: "Você guarda o Códice Arcano na mochila. As runas na capa brilham suavemente. O mercador acena e desaparece na névoa.",
        opcoes: [
            { texto: "Seguir para a Floresta Sussurrante", destino: "floresta" }
        ]
    },
    floresta: {
        titulo: "O Guardião do Portal",
        texto: "No coração da floresta, um golém de pedra bloqueia o santuário do Cristal. Uma inscrição diz: 'Tenho cidades, mas não casas; tenho montanhas, mas não árvores; tenho água, mas não peixes. O que sou eu?'",
        opcoes: [
            {
                texto: "Responder: 'Um Mapa' (Usar Mapa Antigo)",
                destino: "santuario",
                condicao: () => estado.inventario.includes("Mapa Antigo")
            },
            {
                texto: "Lançar Explosão Arcana (-30 Mana)",
                destino: "santuario_forca",
                condicao: () => estado.mana >= 30,
                acao: () => {
                    estado.mana -= 30;
                    tocarSom(220, "sawtooth", 0.3);
                }
            },
            {
                texto: "Tentar passar correndo",
                destino: "derrota",
                acao: () => {
                    estado.vida = 0;
                    tocarSom(120, "sawtooth", 0.4);
                }
            }
        ]
    },
    santuario_forca: {
        titulo: "Vitória Bruta",
        texto: "Sua magia estilhaça a barreira do golém, mas os estilhaços ferem você (-35 Vida). O caminho até o altar está livre!",
        opcoes: [
            {
                texto: "Aproximar-se do Cristal de Eldoria",
                destino: "santuario",
                acao: () => { estado.vida -= 35; }
            }
        ]
    },
    santuario: {
        titulo: "O Cristal de Eldoria",
        texto: "O Cristal flutua sobre o altar emitindo uma luz azulada intensa. Você sente o poder antigo pulsar na sala.",
        opcoes: [
            {
                texto: "Usar o Códice Arcano para absorver o Cristal (Final Secreto)",
                destino: "final_secreto",
                condicao: () => estado.inventario.includes("Códice Arcano")
            },
            {
                texto: "Pegar o Cristal com as mãos",
                destino: "final_normal"
            }
        ]
    },
    final_normal: {
        titulo: "🏆 Fim: O Guardião de Eldoria",
        texto: "Você ergue o Cristal e a névoa sobre o reino se dissipa. Seu nome será lembrado nas canções dos bardos!",
        opcoes: [
            { texto: "Jogar Novamente", destino: "inicio", acao: reiniciarJogo }
        ]
    },
    final_secreto: {
        titulo: "🌟 Final Secreto: Arquimago Supremo",
        texto: "Com o Códice Arcano, você canaliza toda a energia do Cristal sem destruí-lo, tornando-se o novo Arquimago imortal de Eldoria!",
        opcoes: [
            { texto: "Jogar Novamente", destino: "inicio", acao: reiniciarJogo }
        ]
    },
    derrota: {
        titulo: "💀 Fim de Jogo",
        texto: "O golém de pedra bloqueia sua passagem com um golpe devastador. Sua jornada termina aqui.",
        opcoes: [
            { texto: "Tentar Novamente", destino: "inicio", acao: reiniciarJogo }
        ]
    }
};

function reiniciarJogo() {
    estado.vida = 100;
    estado.mana = 50;
    estado.ouro = 20;
    estado.inventario = ["Poção de Vida", "Mapa Antigo"];
}

function atualizarInterface() {
    document.getElementById("stat-vida").textContent = Math.max(0, estado.vida);
    document.getElementById("stat-mana").textContent = estado.mana;
    document.getElementById("stat-ouro").textContent = estado.ouro;

    const listaInv = document.getElementById("lista-inventario");
    listaInv.innerHTML = "";

    estado.inventario.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item;
        li.onclick = () => usarItem(item, index);
        listaInv.appendChild(li);
    });
}

function usarItem(item, index) {
    if (item === "Poção de Vida") {
        estado.vida = Math.min(100, estado.vida + 40);
        estado.inventario.splice(index, 1);
        tocarSom(780, "sine", 0.25);
        alert("Você bebeu a Poção de Vida e recuperou 40 de HP!");
        atualizarInterface();
    } else {
        alert(`Item: ${item} — Pode ser útil durante a história.`);
    }
}

function carregarCena(idCena) {
    if (estado.vida <= 0 && idCena !== "derrota" && idCena !== "inicio") {
        idCena = "derrota";
    }

    const cena = cenas[idCena];
    document.getElementById("cena-titulo").textContent = cena.titulo;
    document.getElementById("cena-texto").textContent = cena.texto;

    const opcoesContainer = document.getElementById("opcoes-container");
    opcoesContainer.innerHTML = "";

    cena.opcoes.forEach(opcao => {
        const btn = document.createElement("button");
        btn.textContent = opcao.texto;

        if (opcao.condicao && !opcao.condicao()) {
            btn.disabled = true;
            btn.textContent += " (Requisito não atingido)";
        }

        btn.onclick = () => {
            tocarSom(440, "triangle", 0.1);
            if (opcao.acao) opcao.acao();
            carregarCena(opcao.destino);
        };

        opcoesContainer.appendChild(btn);
    });

    atualizarInterface();
}

// Inicia o jogo
carregarCena("inicio");