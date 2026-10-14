// ============================================================
// CONFIGURAÇÃO DO ALUNO E API
// ============================================================
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 8,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// PIN mantido estritamente em memória
let pinSessao = null;

// ============================================================
// DADOS LOCAL (FALLBACK SE API RETORNAR NULL)
// ============================================================
const disciplinasPadrao = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

let disciplinasAtuais = [];

// ============================================================
// FUNÇÃO: normalizarNota
// ============================================================
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".").trim();
    if (valor === "") return null;
    valor = parseFloat(valor);
  }

  if (typeof valor !== "number" || isNaN(valor)) {
    return null;
  }

  if (valor >= 0 && valor <= 10) {
    return valor;
  }

  if (valor > 10 && valor <= 100) {
    return valor / 10;
  }

  return null;
}

// ============================================================
// FUNÇÃO: calcularMedia
// ============================================================
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  return soma / validas.length;
}

// ============================================================
// FUNÇÃO: somarFaltas
// ============================================================
function somarFaltas(faltas) {
  if (!Array.isArray(faltas)) return 0;
  return faltas.reduce(function (acc, f) {
    const val = parseInt(f, 10);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

// ============================================================
// FUNÇÃO: definirSituacao
// ============================================================
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= 6.0) {
    return "Bom desempenho";
  }
  return "Atenção";
}

// ============================================================
// FUNÇÃO: formatarNota
// ============================================================
function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

// ============================================================
// FUNÇÃO: criarLinhaTabela
// ============================================================
function criarLinhaTabela(item) {
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const totalFaltas = somarFaltas(item.faltas);
  const situacao = definirSituacao(media);

  let classeSituacao = "situacao-indisponivel";
  if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (situacao === "Atenção") classeSituacao = "situacao-atencao";

  const tr = document.createElement("tr");

  const tdDisc = document.createElement("td");
  tdDisc.textContent = item.disciplina;
  tr.appendChild(tdDisc);

  const td1 = document.createElement("td");
  td1.textContent = formatarNota(n1);
  tr.appendChild(td1);

  const td2 = document.createElement("td");
  td2.textContent = formatarNota(n2);
  tr.appendChild(td2);

  const td3 = document.createElement("td");
  td3.textContent = formatarNota(n3);
  tr.appendChild(td3);

  const tdMedia = document.createElement("td");
  tdMedia.textContent = media === null ? "Ainda não lançada" : formatarNota(media);
  tr.appendChild(tdMedia);

  const tdFaltas = document.createElement("td");
  tdFaltas.textContent = totalFaltas;
  tr.appendChild(tdFaltas);

  const tdSit = document.createElement("td");
  tdSit.className = classeSituacao;
  tdSit.textContent = situacao;
  tr.appendChild(tdSit);

  return tr;
}

// ============================================================
// FUNÇÃO: preencherTabela
// ============================================================
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = "";

  disciplinasAtuais.forEach(function (item) {
    const linha = criarLinhaTabela(item);
    corpo.appendChild(linha);
  });
}

// ============================================================
// FUNÇÃO: preencherCards
// ============================================================
function preencherCards() {
  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let totalBom = 0;
  let totalAtencao = 0;

  disciplinasAtuais.forEach(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);

    if (media !== null) {
      somaMedias += media;
      qtdMedias++;

      if (media >= 6.0) totalBom++;
      else totalAtencao++;
    }

    totalFaltas += somarFaltas(item.faltas);
  });

  const mediaGeral = qtdMedias > 0 ? somaMedias / qtdMedias : null;

  document.getElementById("media-geral").textContent =
    mediaGeral === null ? "—" : formatarNota(mediaGeral);

  document.getElementById("total-faltas").textContent = totalFaltas;
  document.getElementById("total-bom").textContent = totalBom;
  document.getElementById("total-atencao").textContent = totalAtencao;

  document.getElementById("frequencia").textContent = "92%";
  document.getElementById("frequencia-texto").textContent = "Frequência adequada";
}

// ============================================================
// FUNÇÃO: preencherTabelaEdicao
// ============================================================
function preencherTabelaEdicao() {
  const corpo = document.getElementById("corpo-tabela-edicao");
  corpo.innerHTML = "";

  disciplinasAtuais.forEach(function (item, index) {
    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    tdDisc.textContent = item.disciplina;
    tr.appendChild(tdDisc);

    const f1 = Array.isArray(item.faltas) ? (item.faltas[0] ?? 0) : 0;
    const f2 = Array.isArray(item.faltas) ? (item.faltas[1] ?? 0) : 0;
    const f3 = Array.isArray(item.faltas) ? (item.faltas[2] ?? 0) : 0;

    const campos = [
      { name: "tri1", val: item.tri1 },
      { name: "tri2", val: item.tri2 },
      { name: "tri3", val: item.tri3 },
      { name: "f1", val: f1 },
      { name: "f2", val: f2 },
      { name: "f3", val: f3 }
    ];

    campos.forEach(function (c) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "input-edicao";
      input.dataset.index = index;
      input.dataset.campo = c.name;

      if (c.name.startsWith("tri")) {
        const norm = normalizarNota(c.val);
        input.value = norm !== null ? formatarNota(norm) : "";
      } else {
        input.value = c.val ?? 0;
      }

      td.appendChild(input);
      tr.appendChild(td);
    });

    corpo.appendChild(tr);
  });
}

// ============================================================
// FUNÇÃO: autenticarEAbrir
// ============================================================
async function autenticarEAbrir(pin) {
  const msgLogin = document.getElementById("mensagem-login");
  msgLogin.textContent = "";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pin
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const json = await resposta.json();
    pinSessao = pin;

    if (json.dados === null || !json.dados || !json.dados.disciplinas) {
      disciplinasAtuais = JSON.parse(JSON.stringify(disciplinasPadrao));
    } else {
      disciplinasAtuais = json.dados.disciplinas;
    }

    document.getElementById("login-container").classList.add("escondido");
    document.getElementById("boletim-conteudo").classList.remove("escondido");

    preencherTabela();
    preencherCards();
    atualizarGraficos();

  } catch (err) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// ============================================================
// FUNÇÃO: salvarDados
// ============================================================
async function salvarDados() {
  const msgEdicao = document.getElementById("mensagem-edicao");
  msgEdicao.className = "mensagem-status sucesso";
  msgEdicao.textContent = "Salvando...";

  const inputs = document.querySelectorAll(".input-edicao");
  const novasDisciplinas = JSON.parse(JSON.stringify(disciplinasAtuais));

  inputs.forEach(function (input) {
    const idx = parseInt(input.dataset.index, 10);
    const campo = input.dataset.campo;
    const valStr = input.value.trim();

    if (campo === "tri1" || campo === "tri2" || campo === "tri3") {
      if (valStr === "") {
        novasDisciplinas[idx][campo] = null;
      } else {
        const norm = normalizarNota(valStr);
        novasDisciplinas[idx][campo] = norm;
      }
    } else if (campo === "f1" || campo === "f2" || campo === "f3") {
      let fVal = parseInt(valStr, 10);
      if (isNaN(fVal) || fVal < 0) fVal = 0;
      if (!Array.isArray(novasDisciplinas[idx].faltas)) {
        novasDisciplinas[idx].faltas = [0, 0, 0];
      }
      const fIdx = campo === "f1" ? 0 : campo === "f2" ? 1 : 2;
      novasDisciplinas[idx].faltas[fIdx] = fVal;
    }
  });

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.className = "mensagem-status erro";
      msgEdicao.textContent = "Erro ao salvar alterações na API. Tente novamente.";
      return;
    }

    disciplinasAtuais = novasDisciplinas;
    preencherTabela();
    preencherCards();
    atualizarGraficos();

    msgEdicao.className = "mensagem-status sucesso";
    msgEdicao.textContent = "Dados salvos com sucesso.";

  } catch (err) {
    msgEdicao.className = "mensagem-status erro";
    msgEdicao.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// ============================================================
// INICIALIZAÇÃO E EVENTOS
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("info-turma").textContent = CONFIG_ALUNO.turma;
  document.getElementById("info-chamada").textContent = CONFIG_ALUNO.numeroChamada;

  const formLogin = document.getElementById("form-login");
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    const pinVal = document.getElementById("pin-input").value;
    if (pinVal) {
      autenticarEAbrir(pinVal);
    }
  });

  const btnAlternar = document.getElementById("btn-alternar-edicao");
  const painelEdicao = document.getElementById("painel-edicao");

  btnAlternar.addEventListener("click", function () {
    if (painelEdicao.classList.contains("escondido")) {
      preencherTabelaEdicao();
      painelEdicao.classList.remove("escondido");
      btnAlternar.textContent = "Fechar edição";
    } else {
      painelEdicao.classList.add("escondido");
      btnAlternar.textContent = "Alterar dados";
    }
  });

  const btnSalvar = document.getElementById("btn-salvar");
  btnSalvar.addEventListener("click", function () {
    salvarDados();
  });
});

// ============================================================
// ============================================================
// GRÁFICOS — CAMADA SOMENTE DE LEITURA
// ============================================================
// ============================================================

// Paleta baseada no tema existente (verde neon / escuro)
const CORES_GRAFICOS = {
  principal: "#39ff14",
  principalSuave: "rgba(57, 255, 20, 0.35)",
  grade: "rgba(57, 255, 20, 0.15)",
  texto: "#e0e0e0",
  textoFraco: "#aaaaaa",
  fundo: "#1a1a1a",
  alerta: "#ffb020",
  perigo: "#ff4d4d"
};

// Instâncias dos gráficos
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// Referência interna (NÃO exibir na interface)
const REFERENCIA_FALTAS = 350;

// ------------------------------------------------------------
// Obter dados prontos para os gráficos (somente leitura)
// ------------------------------------------------------------
function obterDadosParaGraficos() {
  const lista = Array.isArray(disciplinasAtuais) ? disciplinasAtuais : [];

  const nomes = [];
  const mediasPorDisciplina = [];

  const notasTri1 = [];
  const notasTri2 = [];
  const notasTri3 = [];

  let totalFaltas = 0;

  lista.forEach(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    nomes.push(item.disciplina);
    mediasPorDisciplina.push(calcularMedia([n1, n2, n3]));

    if (n1 !== null) notasTri1.push(n1);
    if (n2 !== null) notasTri2.push(n2);
    if (n3 !== null) notasTri3.push(n3);

    totalFaltas += somarFaltas(item.faltas);
  });

  const mediaTri = function (arr) {
    if (arr.length === 0) return null;
    const soma = arr.reduce(function (acc, v) { return acc + v; }, 0);
    return soma / arr.length;
  };

  return {
    nomes: nomes,
    medias: mediasPorDisciplina,
    evolucao: [mediaTri(notasTri1), mediaTri(notasTri2), mediaTri(notasTri3)],
    totalFaltas: totalFaltas
  };
}

// ------------------------------------------------------------
// GRÁFICO 1 — Média por disciplina (barras horizontais)
// ------------------------------------------------------------
function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  const info = obterDadosParaGraficos();

  if (graficoMedias) {
    graficoMedias.destroy();
    graficoMedias = null;
  }

  graficoMedias = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: info.nomes,
      datasets: [{
        label: "Média",
        data: info.medias,
        backgroundColor: CORES_GRAFICOS.principalSuave,
        borderColor: CORES_GRAFICOS.principal,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.x;
              if (v === null || v === undefined) {
                return "Ainda não lançada";
              }
              return ctx.label + ": " + v.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { color: CORES_GRAFICOS.textoFraco, stepSize: 1 },
          grid: { color: CORES_GRAFICOS.grade }
        },
        y: {
          ticks: { color: CORES_GRAFICOS.texto, font: { size: 11 } },
          grid: { color: CORES_GRAFICOS.grade }
        }
      }
    }
  });
}

// ------------------------------------------------------------
// GRÁFICO 2 — Evolução da média geral
// ------------------------------------------------------------
function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  const info = obterDadosParaGraficos();

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
    graficoEvolucao = null;
  }

  graficoEvolucao = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média geral",
        data: info.evolucao,
        borderColor: CORES_GRAFICOS.principal,
        backgroundColor: CORES_GRAFICOS.principalSuave,
        tension: 0.25,
        fill: true,
        pointBackgroundColor: CORES_GRAFICOS.principal,
        pointBorderColor: CORES_GRAFICOS.principal,
        pointRadius: 5,
        spanGaps: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.y;
              if (v === null || v === undefined) {
                return "Ainda não lançada";
              }
              return "Média: " + v.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { color: CORES_GRAFICOS.textoFraco, stepSize: 1 },
          grid: { color: CORES_GRAFICOS.grade }
        },
        x: {
          ticks: { color: CORES_GRAFICOS.texto },
          grid: { color: CORES_GRAFICOS.grade }
        }
      }
    }
  });
}

// ------------------------------------------------------------
// GRÁFICO 3 — Faltas acumuladas (barra horizontal única)
// ------------------------------------------------------------
function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasAcumuladas");
  if (!canvas) return;

  const info = obterDadosParaGraficos();
  const total = info.totalFaltas;

  // Aparência progressiva (limites internos NÃO são exibidos)
  let corBarra = CORES_GRAFICOS.principal;
  if (total > REFERENCIA_FALTAS * 0.8) {
    corBarra = CORES_GRAFICOS.perigo;
  } else if (total > REFERENCIA_FALTAS * 0.5) {
    corBarra = CORES_GRAFICOS.alerta;
  }

  if (graficoFaltas) {
    graficoFaltas.destroy();
    graficoFaltas = null;
  }

  graficoFaltas = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: [""],
      datasets: [{
        label: "Faltas",
        data: [total],
        backgroundColor: corBarra,
        borderColor: corBarra,
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function () {
              return total + " faltas";
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: REFERENCIA_FALTAS, // uso interno apenas
          display: false,          // não mostrar eixo/ticks
          grid: { display: false }
        },
        y: {
          display: false,
          grid: { display: false }
        }
      }
    }
  });
}

// ------------------------------------------------------------
// Atualiza todos os gráficos
// ------------------------------------------------------------
function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}