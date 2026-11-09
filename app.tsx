import React, { useEffect, useMemo, useRef, useState } from "react";

/* ============================================================
   CodeSpeed Trainer ULTIMATE — v3
   ============================================================ */

/* ---------- Listas de palavras ---------- */

type ListaPalavras = { facil: string[]; medio: string[]; dificil: string[] };

// Importante: nenhuma palavra pode conter espaço (o espaço envia a palavra).
const PALAVRAS: ListaPalavras = {
  facil: [
    "casa", "mesa", "porta", "janela", "carro", "gato", "cachorro", "praia", "sol", "chuva",
    "livro", "caneta", "escola", "amigo", "família", "banana", "maçã", "futebol", "música", "filme",
    "tempo", "verde", "azul", "pão", "café", "bola", "rua", "cidade", "jogo", "noite",
  ],
  medio: [
    "javascript", "backend", "frontend", "algoritmo", "relatório", "dashboard", "faculdade",
    "produtividade", "otimização", "infraestrutura", "desenvolvimento", "persistência",
    "conhecimento", "performance", "repositório", "componente", "variável", "servidor",
    "requisição", "interface", "biblioteca", "framework",
  ],
  dificil: [
    "cybersecurity", "escalabilidade", "criptografia", "virtualização", "responsabilidade",
    "empreendedorismo", "extraordinariamente", "internacionalização", "inteligência",
    "microsserviços", "autenticação", "refatoração", "documentação", "sincronização",
  ],
};

// Modo código: maiúsculas, minúsculas e símbolos contam.
const CODIGO: ListaPalavras = {
  facil: [
    "const", "let", "var", "if", "else", "for", "while", "return", "class", "new",
    "int", "void", "null", "true", "false", "SELECT", "WHERE", "git", "npm", "try",
  ],
  medio: [
    "useState", "useEffect", "console.log()", "function()", "import", "export", "async", "await",
    "String[]", "ArrayList", "@Override", "private", "public", "static", "INSERT", "UPDATE",
    "DELETE", "VARCHAR(255)", "COUNT(*)", "localStorage", "JSON.parse()", "docker",
  ],
  dificil: [
    "System.out.println();", "useMemo(()=>{},[])", "@Autowired", "@RestController",
    "@GetMapping('/')", "Promise.all([])", "AUTO_INCREMENT", "CURRENT_TIMESTAMP",
    "ResponseEntity", "SpringApplication.run()", "document.getElementById()",
    "addEventListener()", "BufferedReader", "NullPointerException", "IllegalArgumentException",
  ],
};

/* ---------- Tipos ---------- */

type TipoJogo = "palavras" | "codigo";

type RankingPlayer = {
  nome: string;
  avatar?: string;
  pontos: number;
  wpm: number;
  precisao: number;
  modo?: number;
  tipo?: TipoJogo;
  data?: string;
};

type HistoricoPartida = {
  data: string;
  pontos: number;
  wpm: number;
  precisao: number;
  melhorCombo: number;
  tipo?: TipoJogo;
  palavra?: string;
};

type Jogo = {
  pontos: number;
  combo: number;
  melhorCombo: number;
  xp: number;
  moedas: number;
  acertos: number;
  tentativas: number;
  caracteres: number;
};

type Resultado = {
  pontos: number;
  wpm: number;
  precisao: number;
  melhorCombo: number;
  xp: number;
  moedas: number;
  novoRecorde: boolean;
  novas: string[];
  nivelNovo?: string;
};

type Aba = "jogar" | "ranking" | "historico" | "conquistas" | "loja";

type Som = "acerto" | "erro" | "combo" | "fim";

/* ---------- Constantes ---------- */

const JOGO_INICIAL: Jogo = {
  pontos: 0,
  combo: 0,
  melhorCombo: 0,
  xp: 0,
  moedas: 0,
  acertos: 0,
  tentativas: 0,
  caracteres: 0,
};

const AVATARES = ["😎", "🤖", "🦊", "🐱", "🚀", "👾", "🔥", "🧠"];
const BONUS_MAX = 15; // tempo extra máximo acima do modo escolhido

const NIVEIS = [
  { nome: "Bronze", min: 0 },
  { nome: "Prata", min: 500 },
  { nome: "Ouro", min: 1500 },
  { nome: "Platina", min: 3500 },
  { nome: "Diamante", min: 7000 },
  { nome: "Lendário", min: 12000 },
];

const DESTAQUES = {
  verde: { nome: "Verde", custo: 0, botao: "bg-green-600", texto: "text-green-400", barra: "bg-green-500", borda: "border-green-500" },
  azul: { nome: "Azul", custo: 100, botao: "bg-sky-600", texto: "text-sky-400", barra: "bg-sky-500", borda: "border-sky-500" },
  roxo: { nome: "Roxo", custo: 250, botao: "bg-violet-600", texto: "text-violet-400", barra: "bg-violet-500", borda: "border-violet-500" },
  laranja: { nome: "Laranja", custo: 500, botao: "bg-orange-600", texto: "text-orange-400", barra: "bg-orange-500", borda: "border-orange-500" },
} as const;

type DestaqueId = keyof typeof DESTAQUES;

type ContextoConquista = {
  melhorCombo: number;
  acertos: number;
  wpm: number;
  precisao: number;
  partidas: number;
  tipo: TipoJogo;
  modoTempo: number;
};

const CONQUISTAS: { id: string; titulo: string; descricao: string; ok: (c: ContextoConquista) => boolean }[] = [
  { id: "primeira", titulo: "🎮 Primeira partida", descricao: "Termine sua primeira partida", ok: (c) => c.partidas >= 1 },
  { id: "combo10", titulo: "🏆 Combo Master", descricao: "Faça um combo de 10", ok: (c) => c.melhorCombo >= 10 },
  { id: "combo25", titulo: "⚡ Imparável", descricao: "Faça um combo de 25", ok: (c) => c.melhorCombo >= 25 },
  { id: "acertos25", titulo: "🔥 Digitador Avançado", descricao: "Acerte 25 palavras em uma partida", ok: (c) => c.acertos >= 25 },
  { id: "wpm40", titulo: "🚀 Velocista", descricao: "Chegue a 40 WPM (mín. 10 acertos)", ok: (c) => c.wpm >= 40 && c.acertos >= 10 },
  { id: "perfeito", titulo: "🎯 Precisão total", descricao: "100% de precisão com 20+ acertos", ok: (c) => c.precisao === 100 && c.acertos >= 20 },
  { id: "veterano", titulo: "🛡️ Veterano", descricao: "Jogue 10 partidas", ok: (c) => c.partidas >= 10 },
  { id: "dev", titulo: "💻 Dev de verdade", descricao: "Acerte 15 trechos de código em uma partida", ok: (c) => c.tipo === "codigo" && c.acertos >= 15 },
  { id: "maratona", titulo: "🏃 Maratonista", descricao: "Acerte 30 palavras no Modo Extremo (120s)", ok: (c) => c.modoTempo === 120 && c.acertos >= 30 },
];

const CHAVES_STORAGE = [
  "nickname-player", "avatar-player", "recorde-player", "historico-player", "ranking-ultimate",
  "xp-total", "moedas-total", "conquistas-player", "destaque-player", "destaques-comprados",
  "tema-escuro", "tipo-jogo", "modo-tempo", "som-ligado",
];

/* ---------- Funções auxiliares ---------- */

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getNivel(xp: number) {
  let indice = 0;
  NIVEIS.forEach((n, i) => {
    if (xp >= n.min) indice = i;
  });
  const atual = NIVEIS[indice];
  const proximo = NIVEIS[indice + 1] ?? null;
  const progresso = proximo ? ((xp - atual.min) / (proximo.min - atual.min)) * 100 : 100;
  return { nome: atual.nome, proximo, progresso: Math.min(100, Math.max(0, progresso)) };
}

function sortear(lista: string[]) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function avaliarConquistas(ctx: ContextoConquista) {
  return CONQUISTAS.filter((c) => c.ok(ctx)).map((c) => c.id);
}

// Mantém compatibilidade com os dados antigos (strings salvas "cruas" no localStorage)
function useStored<T>(key: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return inicial;
      if (typeof inicial === "string") return raw as unknown as T;
      return JSON.parse(raw) as T;
    } catch {
      return inicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, typeof valor === "string" ? valor : JSON.stringify(valor));
    } catch {
      /* armazenamento indisponível */
    }
  }, [key, valor]);

  return [valor, setValor] as const;
}

/* ---------- Componente principal ---------- */

export default function App() {
  // Dados persistentes
  const [nome, setNome] = useStored<string>("nickname-player", "");
  const [avatar, setAvatar] = useStored<string>("avatar-player", "😎");
  const [recordePessoal, setRecordePessoal] = useStored<number>("recorde-player", 0);
  const [historico, setHistorico] = useStored<HistoricoPartida[]>("historico-player", []);
  const [ranking, setRanking] = useStored<RankingPlayer[]>("ranking-ultimate", []);
  const [xpTotal, setXpTotal] = useStored<number>("xp-total", 0);
  const [moedasTotal, setMoedasTotal] = useStored<number>("moedas-total", 0);
  const [conquistas, setConquistas] = useStored<string[]>("conquistas-player", []);
  const [destaqueId, setDestaqueId] = useStored<DestaqueId>("destaque-player", "verde");
  const [comprados, setComprados] = useStored<DestaqueId[]>("destaques-comprados", ["verde"]);
  const [temaEscuro, setTemaEscuro] = useStored<boolean>("tema-escuro", true);
  const [tipoSalvo, setTipo] = useStored<TipoJogo>("tipo-jogo", "palavras");
  const [modo, setModo] = useStored<number>("modo-tempo", 60);
  const [som, setSom] = useStored<boolean>("som-ligado", true);

  const tipo: TipoJogo = tipoSalvo === "codigo" ? "codigo" : "palavras";

  // Estado da partida
  const [jogando, setJogando] = useState(false);
  const [contagem, setContagem] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);
  const [tempo, setTempo] = useState(60);
  const [decorrido, setDecorrido] = useState(0);
  const [palavra, setPalavra] = useState("");
  const [proxima, setProxima] = useState("");
  const [digitado, setDigitado] = useState("");
  const [jogo, setJogo] = useState<Jogo>(JOGO_INICIAL);
  const [erro, setErro] = useState(false);

  // Interface
  const [aba, setAba] = useState<Aba>("jogar");
  const [filtroRanking, setFiltroRanking] = useState<TipoJogo>(tipo);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [aviso, setAviso] = useState("");
  const [erroNome, setErroNome] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recentes = useRef<string[]>([]);
  const audioRef = useRef<AudioContext | null>(null);

  const destaque = DESTAQUES[destaqueId] ?? DESTAQUES.verde;
  const nivel = getNivel(xpTotal + (jogando ? jogo.xp : 0));
  const multiplicador = Math.floor(jogo.combo / 5) + 1;
  const precisao = jogo.tentativas ? Math.round((jogo.acertos / jogo.tentativas) * 100) : 100;
  const timerAtivo = jogando && !pausado && contagem === null;

  // WPM padrão: (caracteres / 5) por minuto, usando o tempo realmente decorrido
  const wpm = useMemo(() => {
    const minutos = Math.max(decorrido, 1) / 60;
    return Math.round(jogo.caracteres / 5 / minutos);
  }, [jogo.caracteres, decorrido]);

  const t = temaEscuro
    ? {
        pagina: "bg-zinc-950 text-zinc-100",
        card: "bg-zinc-900 border-zinc-800",
        input: "bg-zinc-800 text-white border-zinc-700 placeholder:text-zinc-500",
        sub: "text-zinc-400",
        aba: "border-zinc-700 hover:bg-zinc-800",
        trilho: "bg-zinc-700",
      }
    : {
        pagina: "bg-gray-100 text-gray-900",
        card: "bg-white border-gray-200",
        input: "bg-gray-100 text-gray-900 border-gray-300 placeholder:text-gray-400",
        sub: "text-gray-500",
        aba: "border-gray-300 hover:bg-gray-200",
        trilho: "bg-gray-300",
      };

  /* ---------- Utilidades de jogo ---------- */

  // Modo código diferencia maiúsculas/símbolos; modo palavras ignora acento e caixa
  function igual(a: string, b: string) {
    return tipo === "codigo" ? a === b : normalizar(a) === normalizar(b);
  }

  function tocar(efeito: Som) {
    if (!som) return;
    try {
      if (!audioRef.current) audioRef.current = new window.AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();
      const freq: Record<Som, number> = { acerto: 660, erro: 160, combo: 880, fim: 440 };
      osc.type = efeito === "erro" ? "sawtooth" : "sine";
      osc.frequency.value = freq[efeito];
      ganho.gain.setValueAtTime(0.05, ctx.currentTime);
      ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(ganho);
      ganho.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      /* áudio indisponível */
    }
  }

  function escolherPalavra(progresso: number) {
    const base = tipo === "codigo" ? CODIGO : PALAVRAS;
    const r = Math.random();
    let lista = base.facil;

    if (progresso >= 20) {
      lista = r < 0.6 ? base.dificil : r < 0.9 ? base.medio : base.facil;
    } else if (progresso >= 8) {
      lista = r < 0.75 ? base.medio : base.facil;
    }

    const filtradas = lista.filter((p) => !recentes.current.includes(p));
    const escolhida = sortear(filtradas.length ? filtradas : lista);

    recentes.current = [...recentes.current, escolhida].slice(-8);
    return escolhida;
  }

  /* ---------- Lógica do jogo ---------- */

  function iniciar() {
    if (nome.trim().length < 2) {
      setErroNome(true);
      return;
    }

    setErroNome(false);
    recentes.current = [];
    setResultado(null);
    setJogo(JOGO_INICIAL);
    setTempo(modo);
    setDecorrido(0);
    setDigitado("");
    setPausado(false);
    setPalavra(escolherPalavra(0));
    setProxima(escolherPalavra(0));
    setContagem(3);
    setJogando(true);
  }

  function mostrarAviso(ids: string[]) {
    const novas = ids.filter((id) => !conquistas.includes(id));
    if (!novas.length) return [];
    setConquistas((prev) => [...prev, ...novas.filter((id) => !prev.includes(id))]);
    const primeira = CONQUISTAS.find((c) => c.id === novas[0]);
    if (primeira) setAviso(`${primeira.titulo} desbloqueada!`);
    return novas;
  }

  function finalizar() {
    setJogando(false);
    setPausado(false);
    setContagem(null);
    setDigitado("");

    // Partida sem nenhuma palavra enviada não entra no histórico
    if (jogo.tentativas === 0) return;

    const data = new Date().toLocaleDateString("pt-BR");

    setHistorico((prev) =>
      [...prev, { data, pontos: jogo.pontos, wpm, precisao, melhorCombo: jogo.melhorCombo, tipo }].slice(-50)
    );

    const novoRecorde = jogo.pontos > recordePessoal;
    if (novoRecorde) setRecordePessoal(jogo.pontos);

    setRanking((prev) =>
      [...prev, { nome: nome.trim(), avatar, pontos: jogo.pontos, wpm, precisao, modo, tipo, data }]
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 100)
    );

    const nivelAntes = getNivel(xpTotal).nome;
    const nivelDepois = getNivel(xpTotal + jogo.xp).nome;

    setXpTotal((x) => x + jogo.xp);
    setMoedasTotal((m) => m + jogo.moedas);

    const novas = mostrarAviso(
      avaliarConquistas({
        melhorCombo: jogo.melhorCombo,
        acertos: jogo.acertos,
        wpm,
        precisao,
        partidas: historico.length + 1,
        tipo,
        modoTempo: modo,
      })
    );

    setResultado({
      pontos: jogo.pontos,
      wpm,
      precisao,
      melhorCombo: jogo.melhorCombo,
      xp: jogo.xp,
      moedas: jogo.moedas,
      novoRecorde,
      novas,
      nivelNovo: nivelDepois !== nivelAntes ? nivelDepois : undefined,
    });
    setFiltroRanking(tipo);
    setAba("jogar");
    tocar("fim");
  }

  function enviarPalavra(valor: string) {
    const correta = igual(valor.trim(), palavra);

    if (correta) {
      const combo = jogo.combo + 1;
      const mult = Math.floor(combo / 5) + 1;
      const novo: Jogo = {
        pontos: jogo.pontos + mult,
        combo,
        melhorCombo: Math.max(jogo.melhorCombo, combo),
        xp: jogo.xp + 15 * mult,
        moedas: jogo.moedas + mult,
        acertos: jogo.acertos + 1,
        tentativas: jogo.tentativas + 1,
        caracteres: jogo.caracteres + palavra.length,
      };

      setJogo(novo);
      setTempo((tp) => Math.min(tp + 1, modo + BONUS_MAX));
      tocar(combo % 5 === 0 ? "combo" : "acerto");
      mostrarAviso(
        avaliarConquistas({
          melhorCombo: novo.melhorCombo,
          acertos: novo.acertos,
          wpm: 0,
          precisao: 0,
          partidas: 0,
          tipo,
          modoTempo: modo,
        })
      );
      setPalavra(proxima);
      setProxima(escolherPalavra(novo.acertos + Math.floor(novo.combo / 2)));
    } else {
      setJogo({ ...jogo, combo: 0, tentativas: jogo.tentativas + 1 });
      setErro(true);
      setTimeout(() => setErro(false), 300);
      tocar("erro");
    }

    setDigitado("");
  }

  function verificar(valor: string) {
    if (valor.trim() === "") {
      setDigitado("");
      return;
    }
    if (valor.endsWith(" ")) {
      enviarPalavra(valor);
      return;
    }
    setDigitado(valor);
  }

  function comprarDestaque(id: DestaqueId) {
    const item = DESTAQUES[id];
    if (comprados.includes(id)) {
      setDestaqueId(id);
      return;
    }
    if (moedasTotal < item.custo) return;
    setMoedasTotal((m) => m - item.custo);
    setComprados((prev) => [...prev, id]);
    setDestaqueId(id);
  }

  /* ---------- Dados: backup e reset ---------- */

  function exportarDados() {
    const dados: Record<string, string> = {};
    CHAVES_STORAGE.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) dados[k] = v;
    });
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codespeed-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarDados(arquivo: File) {
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const dados = JSON.parse(String(leitor.result)) as Record<string, unknown>;
        CHAVES_STORAGE.forEach((k) => {
          if (typeof dados[k] === "string") localStorage.setItem(k, dados[k] as string);
        });
        window.location.reload();
      } catch {
        setAviso("Arquivo de backup inválido.");
      }
    };
    leitor.readAsText(arquivo);
  }

  function zerarDados() {
    if (!window.confirm("Apagar ranking, histórico, XP, moedas e conquistas? Isso não pode ser desfeito.")) return;
    CHAVES_STORAGE.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  /* ---------- Efeitos ---------- */

  // Contagem regressiva 3-2-1
  useEffect(() => {
    if (!jogando || contagem === null) return;
    const id = setTimeout(() => {
      if (contagem > 1) {
        setContagem(contagem - 1);
      } else {
        setContagem(null);
      }
    }, 800);
    return () => clearTimeout(id);
  }, [contagem, jogando]);

  // Relógio: um único intervalo enquanto a partida está ativa
  useEffect(() => {
    if (!timerAtivo) return;
    const id = setInterval(() => {
      setTempo((tp) => tp - 1);
      setDecorrido((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timerAtivo]);

  // Fim de tempo
  useEffect(() => {
    if (jogando && contagem === null && tempo <= 0) finalizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, jogando]);

  // Devolve o foco ao campo quando a partida começa ou volta da pausa
  useEffect(() => {
    if (timerAtivo) inputRef.current?.focus();
  }, [timerAtivo]);

  // ESC pausa/retoma; trocar de aba do navegador pausa sozinho
  useEffect(() => {
    if (!jogando) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contagem === null) setPausado((p) => !p);
    };
    const onVisibilidade = () => {
      if (document.hidden && contagem === null) setPausado(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibilidade);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibilidade);
    };
  }, [jogando, contagem]);

  // Some com o aviso de conquista
  useEffect(() => {
    if (!aviso) return;
    const id = setTimeout(() => setAviso(""), 3000);
    return () => clearTimeout(id);
  }, [aviso]);

  /* ---------- Renderização ---------- */

  const abas: { id: Aba; rotulo: string }[] = [
    { id: "jogar", rotulo: "🎮 Jogar" },
    { id: "ranking", rotulo: "🏆 Ranking" },
    { id: "historico", rotulo: "📊 Histórico" },
    { id: "conquistas", rotulo: "🎖️ Conquistas" },
    { id: "loja", rotulo: "🛒 Loja" },
  ];

  const ultimas = historico.slice(-10);
  const maiorPontuacao = Math.max(1, ...ultimas.map((p) => p.pontos));
  const mediaWpm = historico.length
    ? Math.round(historico.reduce((s, p) => s + p.wpm, 0) / historico.length)
    : 0;
  const mediaPrecisao = historico.length
    ? Math.round(historico.reduce((s, p) => s + p.precisao, 0) / historico.length)
    : 0;
  const melhorWpm = Math.max(0, ...historico.map((p) => p.wpm));
  const rankingFiltrado = ranking.filter((p) => (p.tipo ?? "palavras") === filtroRanking);

  return (
    <div className={`min-h-screen p-4 md:p-6 ${t.pagina}`}>
      <div className={`max-w-5xl mx-auto rounded-3xl p-5 md:p-8 shadow-2xl border ${t.card}`}>
        {/* Cabeçalho */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">⚡ CodeSpeed Trainer ULTIMATE</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setSom(!som)}
              className={`border px-4 py-2 rounded-xl ${t.aba}`}
              aria-label={som ? "Desligar som" : "Ligar som"}
            >
              {som ? "🔊" : "🔇"}
            </button>
            <button
              onClick={() => setTemaEscuro(!temaEscuro)}
              className={`border px-4 py-2 rounded-xl ${t.aba}`}
            >
              {temaEscuro ? "☀️ Claro" : "🌙 Escuro"}
            </button>
          </div>
        </div>

        {aviso && (
          <div className={`mb-4 text-center font-bold ${destaque.texto}`} role="status">
            {aviso}
          </div>
        )}

        {/* ===== Tela de jogo ===== */}
        {jogando ? (
          <div className="space-y-6">
            {/* Barra de tempo */}
            <div className={`w-full h-2 rounded-full ${t.trilho}`}>
              <div
                className={`h-2 rounded-full transition-all ${tempo <= 10 ? "bg-red-500" : destaque.barra}`}
                style={{ width: `${Math.min(100, Math.max(0, (tempo / modo) * 100))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Tempo", `${Math.max(tempo, 0)}s`],
                ["Pontos", jogo.pontos],
                ["Combo", `${jogo.combo} (x${multiplicador})`],
                ["Melhor Combo", jogo.melhorCombo],
                ["Precisão", `${precisao}%`],
                ["WPM", wpm],
                ["XP da partida", jogo.xp],
                ["Moedas", jogo.moedas],
              ].map(([titulo, valor]) => (
                <div key={String(titulo)} className={`rounded-2xl border p-4 text-center ${t.card}`}>
                  <p className={`text-sm ${t.sub}`}>{titulo}</p>
                  <p className="text-2xl font-bold">{String(valor)}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <p className="font-bold">Nível: {nivel.nome}</p>
                <p className={t.sub}>
                  {nivel.proximo ? `próximo: ${nivel.proximo.nome}` : "nível máximo"}
                </p>
              </div>
              <div className={`w-full h-3 rounded-full mt-2 ${t.trilho}`}>
                <div
                  className={`h-3 rounded-full ${destaque.barra}`}
                  style={{ width: `${nivel.progresso}%` }}
                />
              </div>
            </div>

            <div
              onClick={() => inputRef.current?.focus()}
              className={`rounded-3xl border p-8 text-center transition-colors min-h-[9rem] flex flex-col items-center justify-center ${
                erro ? "border-red-500" : t.card
              }`}
            >
              {contagem !== null ? (
                <p className={`text-6xl font-bold ${destaque.texto}`} aria-live="assertive">
                  {contagem}
                </p>
              ) : pausado ? (
                <div className="space-y-3">
                  <p className="text-3xl font-bold">⏸️ Pausado</p>
                  <button
                    onClick={() => setPausado(false)}
                    className={`${destaque.botao} text-white px-6 py-2 rounded-xl font-bold`}
                  >
                    Continuar (ESC)
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className={`text-3xl md:text-5xl font-bold tracking-wide break-all ${
                      tipo === "codigo" ? "font-mono" : ""
                    }`}
                  >
                    {palavra.split("").map((letra, i) => {
                      const d = digitado[i];
                      let cor = "opacity-50";
                      if (d !== undefined) {
                        cor = igual(d, letra) ? destaque.texto : "text-red-500";
                      }
                      return (
                        <span key={i} className={cor}>
                          {letra}
                        </span>
                      );
                    })}
                  </p>
                  <p className={`mt-4 text-sm ${t.sub} ${tipo === "codigo" ? "font-mono" : ""}`}>
                    próxima: {proxima}
                  </p>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              value={digitado}
              onChange={(e) => verificar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && digitado.trim()) enviarPalavra(digitado);
              }}
              disabled={pausado || contagem !== null}
              placeholder={
                contagem !== null ? "Prepare-se…" : pausado ? "Jogo pausado" : "Digite e pressione espaço ou Enter"
              }
              className={`w-full p-5 rounded-2xl text-xl border outline-none focus:ring-2 disabled:opacity-60 ${t.input} ${
                erro ? "border-red-500" : ""
              } ${tipo === "codigo" ? "font-mono" : ""}`}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            <div className="flex flex-wrap gap-2 justify-between items-center">
              <p className={`text-sm ${t.sub}`}>
                {tipo === "codigo"
                  ? "Modo código: maiúsculas e símbolos contam"
                  : "Acentos e maiúsculas são opcionais"}{" "}
                · ESC pausa
              </p>
              <button onClick={finalizar} className={`border px-4 py-2 rounded-xl text-sm ${t.aba}`}>
                Encerrar partida
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Abas */}
            <div className="flex flex-wrap gap-2 mb-6">
              {abas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className={`px-4 py-2 rounded-xl border text-sm ${
                    aba === a.id ? `${destaque.borda} font-bold` : t.aba
                  }`}
                >
                  {a.rotulo}
                </button>
              ))}
            </div>

            {/* ===== Jogar ===== */}
            {aba === "jogar" && (
              <div className="space-y-4 max-w-xl mx-auto">
                {resultado && (
                  <div className={`rounded-2xl border p-6 ${t.card}`}>
                    <h2 className="font-bold text-xl mb-1">
                      {resultado.novoRecorde ? "🎉 Novo recorde pessoal!" : "Fim de jogo"}
                    </h2>
                    <p className="text-3xl font-bold mb-3">{resultado.pontos} pts</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>⌨️ WPM: <strong>{resultado.wpm}</strong></p>
                      <p>🎯 Precisão: <strong>{resultado.precisao}%</strong></p>
                      <p>🔥 Melhor combo: <strong>{resultado.melhorCombo}</strong></p>
                      <p>✨ XP: <strong>+{resultado.xp}</strong></p>
                      <p>🪙 Moedas: <strong>+{resultado.moedas}</strong></p>
                    </div>
                    {resultado.nivelNovo && (
                      <p className={`mt-3 text-sm font-bold ${destaque.texto}`}>
                        ⬆️ Você subiu para {resultado.nivelNovo}!
                      </p>
                    )}
                    {resultado.novas.length > 0 && (
                      <p className={`mt-3 text-sm ${destaque.texto}`}>
                        Conquistas novas:{" "}
                        {resultado.novas
                          .map((id) => CONQUISTAS.find((c) => c.id === id)?.titulo)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <p className={`text-sm mb-2 ${t.sub}`}>Avatar</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATARES.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAvatar(a)}
                        className={`text-2xl w-12 h-12 rounded-xl border ${
                          avatar === a ? destaque.borda : t.aba
                        }`}
                        aria-label={`Escolher avatar ${a}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  value={nome}
                  maxLength={16}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setErroNome(false);
                  }}
                  placeholder="Digite seu nome"
                  className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 ${t.input} ${
                    erroNome ? "border-red-500" : ""
                  }`}
                />
                {erroNome && (
                  <p className="text-sm text-red-500">O nome precisa ter pelo menos 2 caracteres.</p>
                )}

                <div>
                  <p className={`text-sm mb-2 ${t.sub}`}>Tipo de jogo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ["palavras", "📝 Palavras"],
                      ["codigo", "💻 Código"],
                    ] as [TipoJogo, string][]).map(([id, rotulo]) => (
                      <button
                        key={id}
                        onClick={() => setTipo(id)}
                        className={`py-3 rounded-xl border text-sm ${
                          tipo === id ? `${destaque.borda} font-bold` : t.aba
                        }`}
                      >
                        {rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                <select
                  value={modo}
                  onChange={(e) => setModo(Number(e.target.value))}
                  className={`w-full p-4 rounded-2xl border ${t.input}`}
                >
                  <option value={30}>Desafio 30s</option>
                  <option value={60}>Modo Padrão 60s</option>
                  <option value={120}>Modo Extremo 120s</option>
                </select>

                <button
                  onClick={iniciar}
                  className={`w-full ${destaque.botao} text-white rounded-2xl py-4 font-bold`}
                >
                  {resultado ? "Jogar novamente" : "Iniciar Jogo"}
                </button>

                <div className={`rounded-2xl p-5 border text-sm space-y-1 ${t.card}`}>
                  <p>
                    {avatar} Jogador: <strong>{nome.trim() || "Sem nome"}</strong>
                  </p>
                  <p>
                    🏅 Nível: <strong>{getNivel(xpTotal).nome}</strong> ({xpTotal} XP)
                  </p>
                  <p>
                    🏆 Recorde pessoal: <strong>{recordePessoal} pts</strong>
                  </p>
                  <p>
                    🪙 Moedas: <strong>{moedasTotal}</strong>
                  </p>
                  <p>
                    📊 Partidas registradas: <strong>{historico.length}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* ===== Ranking ===== */}
            {aba === "ranking" && (
              <div className={`rounded-2xl p-5 border max-w-xl mx-auto ${t.card}`}>
                <h2 className="font-bold text-xl mb-3">🏆 Top 100</h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {([
                    ["palavras", "📝 Palavras"],
                    ["codigo", "💻 Código"],
                  ] as [TipoJogo, string][]).map(([id, rotulo]) => (
                    <button
                      key={id}
                      onClick={() => setFiltroRanking(id)}
                      className={`py-2 rounded-xl border text-sm ${
                        filtroRanking === id ? `${destaque.borda} font-bold` : t.aba
                      }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
                {rankingFiltrado.length === 0 && (
                  <p className={t.sub}>Nenhuma partida neste modo ainda. Jogue para entrar no ranking.</p>
                )}
                {rankingFiltrado.slice(0, 20).map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 text-sm border-b border-zinc-700/30 last:border-0"
                  >
                    <span>
                      #{i + 1} {p.avatar ?? "🙂"} {p.nome}
                    </span>
                    <span className="text-right">
                      <strong>{p.pontos} pts</strong>
                      <span className={`block text-xs ${t.sub}`}>
                        {p.wpm} WPM · {p.precisao}%{p.modo ? ` · ${p.modo}s` : ""}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ===== Histórico ===== */}
            {aba === "historico" && (
              <div className={`rounded-2xl p-5 border max-w-xl mx-auto ${t.card}`}>
                <h2 className="font-bold text-xl mb-3">📊 Suas estatísticas</h2>
                {historico.length === 0 ? (
                  <p className={t.sub}>Seu histórico aparece aqui depois da primeira partida.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                      {[
                        ["WPM médio", mediaWpm],
                        ["Melhor WPM", melhorWpm],
                        ["Precisão média", `${mediaPrecisao}%`],
                      ].map(([titulo, valor]) => (
                        <div key={String(titulo)} className={`rounded-xl border p-3 ${t.card}`}>
                          <p className={`text-xs ${t.sub}`}>{titulo}</p>
                          <p className="text-xl font-bold">{String(valor)}</p>
                        </div>
                      ))}
                    </div>

                    <p className={`text-sm mb-2 ${t.sub}`}>Pontos das últimas {ultimas.length} partidas</p>
                    <div className="flex items-end gap-2 h-32 mb-4" aria-label="Pontos das últimas partidas">
                      {ultimas.map((p, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-xs mb-1">{p.pontos}</span>
                          <div
                            className={`w-full rounded-t ${destaque.barra}`}
                            style={{ height: `${(p.pontos / maiorPontuacao) * 100}%`, minHeight: 4 }}
                          />
                        </div>
                      ))}
                    </div>
                    {[...ultimas].reverse().map((p, i) => (
                      <div key={i} className="flex justify-between py-1 text-sm">
                        <span className={t.sub}>
                          {p.data} {p.tipo === "codigo" ? "💻" : "📝"}
                        </span>
                        <span>
                          {p.pontos} pts · {p.wpm} WPM · {p.precisao}% · combo {p.melhorCombo}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ===== Conquistas ===== */}
            {aba === "conquistas" && (
              <div className="max-w-xl mx-auto space-y-3">
                <p className={`text-sm ${t.sub}`}>
                  {conquistas.length} de {CONQUISTAS.length} desbloqueadas
                </p>
                {CONQUISTAS.map((c) => {
                  const ok = conquistas.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`rounded-2xl border p-4 ${t.card} ${ok ? destaque.borda : "opacity-60"}`}
                    >
                      <p className="font-bold">{ok ? c.titulo : `🔒 ${c.titulo.slice(2).trim()}`}</p>
                      <p className={`text-sm ${t.sub}`}>{c.descricao}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== Loja ===== */}
            {aba === "loja" && (
              <div className="max-w-xl mx-auto space-y-3">
                <p className="text-sm">
                  🪙 Suas moedas: <strong>{moedasTotal}</strong>
                </p>
                {(Object.keys(DESTAQUES) as DestaqueId[]).map((id) => {
                  const item = DESTAQUES[id];
                  const tem = comprados.includes(id);
                  const ativo = destaqueId === id;
                  return (
                    <div key={id} className={`rounded-2xl border p-4 flex items-center justify-between ${t.card}`}>
                      <div className="flex items-center gap-3">
                        <span className={`inline-block w-6 h-6 rounded-full ${item.barra}`} />
                        <div>
                          <p className="font-bold">Cor {item.nome}</p>
                          <p className={`text-xs ${t.sub}`}>{tem ? "Desbloqueada" : `${item.custo} moedas`}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => comprarDestaque(id)}
                        disabled={!tem && moedasTotal < item.custo}
                        className={`px-4 py-2 rounded-xl text-sm text-white disabled:opacity-40 ${item.botao}`}
                      >
                        {ativo ? "Em uso" : tem ? "Usar" : "Comprar"}
                      </button>
                    </div>
                  );
                })}

                <div className={`rounded-2xl border p-4 mt-6 space-y-3 ${t.card}`}>
                  <p className="font-bold">Seus dados</p>
                  <p className={`text-xs ${t.sub}`}>
                    O progresso fica salvo só neste navegador. Faça um backup para levar para outro lugar.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={exportarDados} className={`border rounded-xl py-2 text-sm ${t.aba}`}>
                      Exportar backup
                    </button>
                    <label className={`border rounded-xl py-2 text-sm text-center cursor-pointer ${t.aba}`}>
                      Importar backup
                      <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => {
                          const arquivo = e.target.files?.[0];
                          if (arquivo) importarDados(arquivo);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={zerarDados}
                  className="w-full mt-2 border border-red-500 text-red-500 rounded-xl py-3 text-sm"
                >
                  Zerar todos os dados
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
