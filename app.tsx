import React, { useEffect, useMemo, useState } from 'react';

const palavras = [
  'trabalho', 'sistema', 'suporte', 'teclado', 'rapidez', 'portugues',
  'internet', 'rede', 'senha', 'arquivo', 'comando', 'terminal',

  'javascript', 'python', 'java', 'react', 'node', 'typescript',
  'frontend', 'backend', 'fullstack', 'api', 'framework', 'debug',
  'algoritmo', 'logica', 'funcao', 'variavel', 'objeto', 'array',

  'servidor', 'cloud', 'docker', 'container', 'linux', 'windows',
  'firewall', 'seguranca', 'criptografia', 'cybersecurity',
  'virtualizacao', 'escalabilidade', 'infraestrutura',

  'mysql', 'postgresql', 'mongodb', 'query', 'bancodedados',

  'github', 'git', 'deploy', 'pipeline', 'ci', 'cd',
  'performance', 'otimizacao', 'build', 'bundle',

  'excel', 'documento', 'relatorio', 'analise', 'dashboard',
  'produtividade', 'inovacao', 'automacao', 'gestao', 'ticket'
];

const bosses = [
  '👹 SEGURANCA_DA_INFORMACAO',
  '🔥 ARQUITETURA_DE_SISTEMAS',
  '💀 PROTOCOLO_DE_REDE_AVANCADO',
  '⚡ INTELIGENCIA_ARTIFICIAL_MAXIMA',
  '🚨 SERVIDOR_GLOBAL_OFFLINE',
  '🧠 MACHINE_LEARNING_BOSS',
  '☠️ CYBER_ATTACK_SIMULADO'
];

type RankingPlayer = {
  nome: string;
  pontos: number;
  precisao: number;
  wpm: number;
  data: string;
};

function sortearPalavra(historico: string[]) {
  const disponiveis = palavras.filter((p) => !historico.includes(p));
  const base = disponiveis.length > 0 ? disponiveis : palavras;
  return base[Math.floor(Math.random() * base.length)];
}

function getNivel(xp: number) {
  if (xp >= 1000) return 'Lendário';
  if (xp >= 500) return 'Platina';
  if (xp >= 250) return 'Ouro';
  if (xp >= 100) return 'Prata';
  return 'Bronze';
}

export default function App() {
  const [nome, setNome] = useState('');
  const [jogando, setJogando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  const [palavraAtual, setPalavraAtual] = useState('');
  const [digitado, setDigitado] = useState('');
  const [historicoPalavras, setHistoricoPalavras] = useState<string[]>([]);

  const [pontos, setPontos] = useState(0);
  const [tempo, setTempo] = useState(60);
  const [combo, setCombo] = useState(0);
  const [melhorCombo, setMelhorCombo] = useState(0);
  const [tentativas, setTentativas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [xp, setXp] = useState(0);
  const [achievement, setAchievement] = useState('');
  const [bossFight, setBossFight] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);

  const precisao = useMemo(() => {
    if (tentativas === 0) return 100;
    return Math.round((acertos / tentativas) * 100);
  }, [tentativas, acertos]);

  const wpm = useMemo(() => {
    const minutos = Math.max((60 - tempo) / 60, 1 / 60);
    return Math.max(Math.round(acertos / minutos), 0);
  }, [tempo, acertos]);

  const nivel = getNivel(xp);
  const progressoXp = xp % 100;

  useEffect(() => {
    const salvo = localStorage.getItem('ranking-codespeed');

    if (salvo) {
      try {
        setRanking(JSON.parse(salvo));
      } catch {
        setRanking([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!jogando) return;

    if (tempo <= 0) {
      const novoRanking = [
        ...ranking,
        {
          nome,
          pontos,
          precisao,
          wpm,
          data: new Date().toLocaleDateString()
        }
      ]
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 10);

      localStorage.setItem('ranking-codespeed', JSON.stringify(novoRanking));

      setRanking(novoRanking);
      setJogando(false);
      setFinalizado(true);
      return;
    }

    const timer = setTimeout(() => {
      setTempo((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tempo, jogando, ranking, nome, pontos, precisao, wpm]);

  function iniciarJogo() {
    if (nome.trim().length < 2) return;

    const primeira = sortearPalavra([]);

    setJogando(true);
    setFinalizado(false);
    setPontos(0);
    setTempo(60);
    setCombo(0);
    setMelhorCombo(0);
    setTentativas(0);
    setAcertos(0);
    setXp(0);
    setAchievement('');
    setBossFight(false);
    setDigitado('');
    setPalavraAtual(primeira);
    setHistoricoPalavras([primeira]);
  }

  // 🚪 NOVO: CANCELAR JOGO
  function cancelarJogo() {
    setJogando(false);
    setFinalizado(false);

    setPontos(0);
    setTempo(60);
    setCombo(0);
    setMelhorCombo(0);
    setTentativas(0);
    setAcertos(0);
    setXp(0);
    setAchievement('');
    setBossFight(false);
    setDigitado('');
    setPalavraAtual('');
    setHistoricoPalavras([]);
  }

  function proximaPalavra() {
    setHistoricoPalavras((prev) => {
      const ultimas = prev.slice(-20);
      const nova = sortearPalavra(ultimas);

      setPalavraAtual(nova);

      return [...ultimas, nova];
    });
  }

  function verificarDigitacao(valor: string) {
    setDigitado(valor);

    if (!jogando) return;

    if (valor.endsWith(' ')) {
      const tentativa = tentativas + 1;
      setTentativas(tentativa);

      if (valor.trim().toLowerCase() === palavraAtual.toLowerCase()) {
        const novoCombo = combo + 1;
        const novosAcertos = acertos + 1;
        const bossAtivo = (pontos + 1) % 8 === 0;

        setPontos((prev) => prev + (bossAtivo ? 5 : 1));
        setCombo(novoCombo);
        setMelhorCombo((prev) => Math.max(prev, novoCombo));
        setAcertos(novosAcertos);
        setXp((prev) => prev + (bossAtivo ? 50 : 15));
        setTempo((prev) => prev + 1);

        if (novoCombo >= 5) {
          setAchievement('🔥 Combo Master desbloqueado!');
        }

        if (novosAcertos >= 20) {
          setAchievement('🏆 Digitador Avançado desbloqueado!');
        }

        if (bossAtivo) {
          const bossAleatorio =
            bosses[Math.floor(Math.random() * bosses.length)];

          setBossFight(true);
          setPalavraAtual(bossAleatorio);
        } else {
          setBossFight(false);
          proximaPalavra();
        }

        setDigitado('');
      } else {
        setCombo(0);
        setBossFight(false);
        setDigitado('');
      }
    }
  }

  return (
    <div className={`min-h-screen p-6 flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <div className={`w-full max-w-5xl rounded-3xl p-8 shadow-2xl ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white text-black'}`}>

        <div className="text-center space-y-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-4 py-2 rounded-xl"
          >
            {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>

          <h1 className="text-5xl font-bold">
            ⚡ CodeSpeed Trainer PRO
          </h1>

          <p className="text-zinc-400">
            Digitação • Ranking • XP • Combo • Boss Fight
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <p className="font-semibold">Nível: {nivel}</p>

          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${progressoXp}%` }}
            />
          </div>

          <p className="text-sm">XP Total: {xp}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            ['Pontos', pontos],
            ['Tempo', `${tempo}s`],
            ['Precisão', `${precisao}%`],
            ['WPM', wpm],
            ['Combo', combo],
            ['Melhor Combo', melhorCombo],
            ['XP', xp],
            ['Nível', nivel]
          ].map(([titulo, valor]) => (
            <div key={String(titulo)} className="bg-zinc-900 rounded-2xl p-4 text-center">
              <p className="text-sm text-zinc-400">{titulo}</p>
              <p className="text-2xl font-bold">{String(valor)}</p>
            </div>
          ))}
        </div>

        {!jogando ? (
          <div className="space-y-4 max-w-xl mx-auto mt-10">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full rounded-2xl text-lg p-4 bg-zinc-800 text-white"
            />

            <button
              onClick={iniciarJogo}
              className="w-full bg-green-600 hover:bg-green-700 rounded-2xl py-4 text-lg"
            >
              Iniciar Jogo
            </button>

            {finalizado && (
              <div className="bg-zinc-900 rounded-2xl p-6 text-center space-y-2">
                <p className="text-xl font-bold">Fim de jogo, {nome}!</p>
                <p>Pontuação: {pontos}</p>
                <p>Precisão: {precisao}%</p>
                <p>WPM: {wpm}</p>
                <p>Melhor Combo: {melhorCombo}</p>
              </div>
            )}

            <div className="bg-zinc-900 rounded-2xl p-6 space-y-2">
              <h2 className="font-bold text-lg">🏆 TOP 10 Ranking</h2>

              {ranking.map((player, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>#{index + 1} {player.nome}</span>
                  <span>{player.pontos} pts</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto mt-10">

            {/* 🚪 BOTÃO CANCELAR */}
            <div className="flex justify-end">
              <button
                onClick={cancelarJogo}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
              >
                Cancelar Jogo
              </button>
            </div>

            <div className="text-center space-y-2">
              <p>Jogador: <strong>{nome}</strong></p>
              <p>🔥 Combo Atual: x{combo}</p>
              {achievement && (
                <p className="font-bold text-green-400">{achievement}</p>
              )}
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 text-center">
              <p className={`text-4xl font-bold tracking-widest ${bossFight ? 'text-red-400 animate-pulse' : ''}`}>
                {palavraAtual}
              </p>
            </div>

            <input
              value={digitado}
              onChange={(e) => verificarDigitacao(e.target.value)}
              placeholder="Digite e pressione espaço..."
              className="w-full rounded-2xl text-xl p-6 bg-zinc-800 text-white"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
