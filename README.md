# ⚡ CodeSpeed Trainer

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Jogo de digitação feito com React para treinar **velocidade e precisão**. Digite as palavras (ou trechos de código) que aparecem na tela, acumule combos, ganhe XP e suba de nível.

<!-- Adicione aqui um GIF ou print do jogo, por exemplo:
![CodeSpeed Trainer em ação](docs/demo.gif)
-->

<!-- Se o projeto estiver publicado, adicione o link:
🔗 **Jogue agora:** https://seu-projeto.vercel.app
-->

## 📋 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Como jogar](#-como-jogar)
- [Regras de pontuação](#-regras-de-pontuação)
- [Tecnologias](#-tecnologias)
- [Como executar](#-como-executar)
- [Dados salvos](#-dados-salvos)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Melhorias futuras](#-melhorias-futuras)
- [Autor](#-autor)

## 🎯 Sobre o projeto

O CodeSpeed Trainer nasceu como um projeto de estudo para praticar React e TypeScript, e cresceu até virar um jogo completo, com sistema de níveis, conquistas, ranking e loja.

Todo o progresso fica salvo no próprio navegador. Não é preciso criar conta nem ter um servidor.

## ✨ Funcionalidades

**Jogo**

- Dois tipos de jogo: **Palavras** e **Código** (trechos como `useState`, `System.out.println();` e `COUNT(*)`)
- Partidas de **30, 60 ou 120 segundos**
- Contagem regressiva 3-2-1 antes de começar
- Pausa com `ESC` (o jogo também pausa sozinho ao trocar de aba do navegador)
- Cada letra muda de cor enquanto você digita, e a próxima palavra aparece como prévia
- Dificuldade que aumenta conforme o seu desempenho
- Palavras recentes são evitadas para deixar as partidas mais variadas
- Efeitos sonoros para acerto, erro, combo e fim de jogo

**Progressão**

- Pontos, combo com multiplicador, XP e moedas
- 6 níveis: Bronze, Prata, Ouro, Platina, Diamante e Lendário
- 9 conquistas desbloqueáveis
- Loja de cores de destaque, comprada com as moedas ganhas
- Recorde pessoal

**Acompanhamento**

- Ranking Top 100, separado por tipo de jogo
- Histórico das últimas partidas, com gráfico de pontos
- WPM médio, melhor WPM e precisão média

**Personalização**

- Escolha de nome e avatar
- Modo claro e escuro
- Backup do progresso: exportar e importar em arquivo `.json`

## 🕹️ Como jogar

1. Digite seu nome (mínimo de 2 caracteres) e escolha um avatar.
2. Escolha o tipo de jogo (Palavras ou Código) e a duração da partida.
3. Clique em **Iniciar Jogo** e aguarde a contagem regressiva.
4. Digite a palavra mostrada e pressione **espaço** ou **Enter** para enviar.
5. Acertos aumentam o combo e dão tempo extra. Erros zeram o combo.

| Tecla | Ação |
| --- | --- |
| `Espaço` ou `Enter` | Envia a palavra digitada |
| `ESC` | Pausa ou retoma a partida |

**Dicas**

- No modo **Palavras**, acentos e maiúsculas são opcionais.
- No modo **Código**, maiúsculas e símbolos contam.

## 🧮 Regras de pontuação

- **Pontos:** cada acerto vale o multiplicador atual. O multiplicador começa em `x1` e sobe `+1` a cada 5 acertos seguidos.
- **XP:** cada acerto dá `15 × multiplicador`.
- **Moedas:** cada acerto dá o valor do multiplicador.
- **Tempo extra:** cada acerto adiciona `+1s`, até um máximo de `+15s` acima da duração escolhida.
- **WPM:** `(caracteres corretos ÷ 5) ÷ minutos jogados`, o cálculo padrão usado em testes de digitação.
- **Precisão:** porcentagem de palavras enviadas que estavam corretas.

**Níveis**

| Nível | XP necessário |
| --- | --- |
| Bronze | 0 |
| Prata | 500 |
| Ouro | 1.500 |
| Platina | 3.500 |
| Diamante | 7.000 |
| Lendário | 12.000 |

## 🛠️ Tecnologias

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Como executar

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18 ou superior e npm.

Clone o repositório:

```bash
git clone https://github.com/LipinnDEV/codespeed-trainer.git
cd codespeed-trainer
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## 💾 Dados salvos

O jogo usa o `localStorage` do navegador para guardar:

- Nome e avatar
- Recorde pessoal
- Histórico de partidas (últimas 50)
- Ranking (Top 100)
- XP, moedas, conquistas e cores compradas
- Preferências: tema, tipo de jogo, duração e som

Como os dados ficam só no seu navegador, limpar os dados do site apaga o progresso. Para evitar isso, use **Loja → Exportar backup**. Para recomeçar do zero, use **Loja → Zerar todos os dados**.

## 📁 Estrutura do projeto

```text
codespeed-trainer/
├── public/
├── src/
│   ├── App.tsx        # Lógica e interface do jogo
│   ├── main.tsx       # Ponto de entrada da aplicação
│   └── index.css      # Estilos globais e Tailwind
├── index.html
├── package.json
└── README.md
```

## 🔭 Melhorias futuras

- [ ] Ranking online compartilhado entre jogadores
- [ ] Mais listas de palavras e trechos de código (Java, SQL, Python)
- [ ] Modo para treinar apenas as palavras em que você mais erra
- [ ] Testes automatizados da lógica de pontuação
- [ ] Dividir o `App.tsx` em componentes e hooks menores

## 👤 Autor

Feito por **Felipe Da Silva Mousinho**, estudante de Desenvolvimento de Sistemas.

[![GitHub](https://img.shields.io/badge/GitHub-LipinnDEV-181717?style=for-the-badge&logo=github)](https://github.com/LipinnDEV)

---

⭐ Se gostou do projeto, deixe uma estrela no repositório!
