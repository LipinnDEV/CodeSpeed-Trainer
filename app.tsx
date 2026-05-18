import React, { useEffect, useMemo, useState } from "react";

const palavrasFacil = [
  "casa", "mesa", "porta", "janela", "carro", "gato", "cachorro", "praia", "sol", "chuva",
  "livro", "caneta", "escola", "amigo", "familia", "banana", "maca", "futebol", "musica", "filme"
];

const palavrasMedio = [
  "javascript", "backend", "frontend", "algoritmo", "relatorio", "dashboard", "faculdade", "produtividade",
  "otimizacao", "infraestrutura", "desenvolvimento", "persistencia", "conhecimento", "performance"
];

const palavrasDificil = [
  "cybersecurity", "escalabilidade", "criptografia", "virtualizacao", "responsabilidade",
  "empreendedorismo", "extraordinariamente", "internacionalizacao", "inteligenciaartificial"
];

type RankingPlayer = {
  nome: string;
  pontos: number;
  wpm: number;
  precisao: number;
};

type HistoricoPartida = {
  data: string;
  pontos: number;
  wpm: number;
  precisao: number;
  melhorCombo: number;
  palavra: string;
};

function randomWord(lista: string[]) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function getNivel(xp: number) {
  if (xp >= 1000) return "Lendário";
  if (xp >= 700) return "Diamante";
  if (xp >= 500) return "Platina";
  if (xp >= 250) return "Ouro";
  if (xp >= 100) return "Prata";
  return "Bronze";
}

export default function App() {
  const [nome, setNome] = useState(localStorage.getItem("nickname-player") || "");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar-player") || "😎");
  const [recordePessoal, setRecordePessoal] = useState(Number(localStorage.getItem("recorde-player") || 0));
  const [historicoPartidas, setHistoricoPartidas] = useState<HistoricoPartida[]>(
    JSON.parse(localStorage.getItem("historico-player") || "[]")
  );

  const [jogando, setJogando] = useState(false);
  const [tempo, setTempo] = useState(60);
  const [modo, setModo] = useState(60);
  const [palavra, setPalavra] = useState("");
  const [digitado, setDigitado] = useState("");
  const [pontos, setPontos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [melhorCombo, setMelhorCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [moedas, setMoedas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [tentativas, setTentativas] = useState(0);
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [conquista, setConquista] = useState("");

  const nivel = getNivel(xp);

  const precisao = useMemo(() => {
    if (!tentativas) return 100;
    return Math.round((acertos / tentativas) * 100);
  }, [acertos, tentativas]);

  const wpm = useMemo(() => {
    const minutos = Math.max((modo - tempo) / 60, 1 / 60);
    return Math.max(Math.round(acertos / minutos), 0);
  }, [tempo, acertos, modo]);

  function escolherPalavra() {
    const desempenho = pontos + combo + Math.floor(precisao / 10);

    let lista = palavrasFacil;
    if (desempenho >= 20) lista = palavrasMedio;
    if (desempenho >= 45) lista = palavrasDificil;

    const historicoRecente = historicoPartidas
      .slice(-10)
      .map((item) => item.palavra)
      .filter(Boolean);

    const filtradas = lista.filter((p) => !historicoRecente.includes(p));
    const finalLista = filtradas.length ? filtradas : lista;

    return randomWord(finalLista);
  }

  function iniciar() {
    if (nome.trim().length < 2) return;

    setJogando(true);
    setTempo(modo);
    setPontos(0);
    setCombo(0);
    setMelhorCombo(0);
    setXp(0);
    setMoedas(0);
    setAcertos(0);
    setTentativas(0);
    setConquista("");
    setDigitado("");
    setPalavra(escolherPalavra());
  }

  function finalizar() {
    const novaPartida: HistoricoPartida = {
      data: new Date().toLocaleDateString(),
      pontos,
      wpm,
      precisao,
      melhorCombo,
      palavra,
    };

    const novoHistorico = [...historicoPartidas, novaPartida].slice(-50);
    setHistoricoPartidas(novoHistorico);
    localStorage.setItem("historico-player", JSON.stringify(novoHistorico));

    if (pontos > recordePessoal) {
      setRecordePessoal(pontos);
      localStorage.setItem("recorde-player", String(pontos));
    }

    const novoRanking = [...ranking, { nome, pontos, wpm, precisao }]
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 100);

    setRanking(novoRanking);
    localStorage.setItem("ranking-ultimate", JSON.stringify(novoRanking));
    setJogando(false);
  }

  useEffect(() => {
    const salvo = localStorage.getItem("ranking-ultimate");
    if (salvo) {
      setRanking(JSON.parse(salvo));
    }
  }, []);

  useEffect(() => {
    if (!jogando) return;

    if (tempo <= 0) {
      finalizar();
      return;
    }

    const timer = setTimeout(() => {
      setTempo((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tempo, jogando]);

  function verificar(valor: string) {
    setDigitado(valor);

    if (!valor.endsWith(" ")) return;

    setTentativas((t) => t + 1);

    if (valor.trim().toLowerCase() === palavra.toLowerCase()) {
      const novoCombo = combo + 1;
      const multiplicador = Math.max(1, Math.floor(novoCombo / 5) + 1);

      setCombo(novoCombo);
      setMelhorCombo((m) => Math.max(m, novoCombo));
      setAcertos((a) => a + 1);
      setPontos((p) => p + multiplicador);
      setXp((x) => x + 15 * multiplicador);
      setMoedas((m) => m + multiplicador);
      setTempo((t) => t + 1);

      if (novoCombo >= 10) {
        setConquista("🏆 Combo Master desbloqueado");
      }

      if (acertos + 1 >= 25) {
        setConquista("🔥 Digitador Avançado desbloqueado");
      }

      setPalavra(escolherPalavra());
    } else {
      setCombo(0);
    }

    setDigitado("");
  }

  return (
    <div className={`min-h-screen p-6 ${temaEscuro ? "bg-black text-white" : "bg-gray-100 text-black"}`}>
      <div className="max-w-6xl mx-auto rounded-3xl p-8 shadow-2xl border">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">⚡ CodeSpeed Trainer ULTIMATE</h1>

          <button
            onClick={() => setTemaEscuro(!temaEscuro)}
            className="border px-4 py-2 rounded-xl"
          >
            {temaEscuro ? "☀️ Claro" : "🌙 Escuro"}
          </button>
        </div>

        {!jogando ? (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <input
                value={avatar}
                onChange={(e) => {
                  setAvatar(e.target.value);
                  localStorage.setItem("avatar-player", e.target.value);
                }}
                placeholder="Avatar ex: 😎"
                className="w-full p-4 rounded-2xl bg-zinc-800 text-white"
              />

              <input
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  localStorage.setItem("nickname-player", e.target.value);
                }}
                placeholder="Digite seu nome"
                className="w-full p-4 rounded-2xl bg-zinc-800 text-white"
              />
            </div>

            <select
              value={modo}
              onChange={(e) => setModo(Number(e.target.value))}
              className="w-full p-4 rounded-2xl bg-zinc-800 text-white"
            >
              <option value={30}>Desafio 30s</option>
              <option value={60}>Modo Padrão 60s</option>
              <option value={120}>Modo Extremo 120s</option>
            </select>

            <button
              onClick={iniciar}
              className="w-full bg-green-600 rounded-2xl py-4 font-bold"
            >
              Iniciar Jogo
            </button>

            <div className="rounded-2xl p-6 border">
              <h2 className="font-bold text-xl mb-3">🏆 TOP 100</h2>

              <div className="mb-4 space-y-1 text-sm">
                <p>{avatar} Jogador: <strong>{nome || "Sem nome"}</strong></p>
                <p>🏅 Recorde Pessoal: <strong>{recordePessoal} pts</strong></p>
                <p>📊 Partidas Registradas: <strong>{historicoPartidas.length}</strong></p>
              </div>

              {ranking.slice(0, 10).map((p, i) => (
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span>#{i + 1} {p.nome}</span>
                  <span>{p.pontos} pts</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Tempo", `${tempo}s`],
                ["Pontos", pontos],
                ["Combo", combo],
                ["Melhor Combo", melhorCombo],
                ["Precisão", `${precisao}%`],
                ["WPM", wpm],
                ["XP", xp],
                ["Moedas", moedas],
              ].map(([titulo, valor]) => (
                <div key={String(titulo)} className="rounded-2xl border p-4 text-center">
                  <p className="text-sm opacity-70">{titulo}</p>
                  <p className="text-2xl font-bold">{String(valor)}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="font-bold">Nível: {nivel}</p>

              <div className="w-full h-3 rounded-full bg-gray-700 mt-2">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${xp % 100}%` }}
                />
              </div>
            </div>

            {conquista && (
              <div className="text-center font-bold text-green-400">
                {conquista}
              </div>
            )}

            <div className="rounded-3xl border p-8 text-center">
              <p className="text-4xl font-bold">{palavra}</p>
            </div>

            <input
              value={digitado}
              onChange={(e) => verificar(e.target.value)}
              placeholder="Digite e pressione espaço"
              className="w-full p-6 rounded-2xl text-xl bg-zinc-800 text-white"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
