# CodeSpeed Trainer

O **CodeSpeed Trainer** é um jogo de digitação desenvolvido com React, criado para treinar velocidade, precisão e agilidade no teclado.

O projeto utiliza palavras em português e termos relacionados à tecnologia e ao ambiente profissional, permitindo que o jogador pratique enquanto acompanha seu desempenho durante as partidas.

## Objetivo

O objetivo do jogo é digitar as palavras apresentadas na tela o mais rápido possível, tentando manter uma boa precisão e aumentar a pontuação.

Durante a partida, o jogador pode acompanhar seu:

- Tempo
- Pontuação
- Combo
- Melhor combo
- Precisão
- WPM
- XP
- Moedas
- Nível

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- JavaScript
- LocalStorage

## Funcionalidades

### Sistema de níveis

O jogador recebe XP durante as partidas e pode subir de nível conforme acumula experiência.

Os níveis disponíveis são:

- Bronze
- Prata
- Ouro
- Platina
- Diamante
- Lendário

### Modos de jogo

O jogo possui três opções de tempo:

- Desafio 30 segundos
- Modo Padrão 60 segundos
- Modo Extremo 120 segundos

### Sistema de pontuação

A pontuação aumenta conforme o jogador acerta as palavras.

Também existe um sistema de combo que aumenta o multiplicador de pontos conforme o jogador consegue manter uma sequência de acertos.

### Precisão e WPM

O sistema calcula a precisão com base na quantidade de palavras acertadas em relação às tentativas.

Também é calculado o **WPM (Words Per Minute)**, utilizado para acompanhar a velocidade de digitação do jogador.

### Ranking

O jogo possui um ranking com os melhores resultados dos jogadores.

Os resultados são organizados de acordo com a pontuação obtida durante as partidas.

### Histórico

As partidas realizadas ficam registradas no navegador, permitindo acompanhar informações como:

- Data da partida
- Pontuação
- WPM
- Precisão
- Melhor combo
- Palavra utilizada

### Avatar e nome

O jogador pode escolher um nome e um avatar antes de iniciar a partida.

Essas informações também ficam salvas no navegador.

### Sistema de conquistas

Durante o jogo, algumas conquistas podem ser desbloqueadas, como:

- Combo Master
- Digitador Avançado

## Palavras

As palavras são separadas em três níveis de dificuldade.

### Fácil

Palavras comuns do dia a dia, como:

- casa
- mesa
- escola
- amigo
- futebol
- música

### Médio

Palavras relacionadas à tecnologia, estudos e produtividade, como:

- JavaScript
- backend
- frontend
- algoritmo
- desenvolvimento
- performance

### Difícil

Termos mais complexos, como:

- cybersecurity
- escalabilidade
- criptografia
- virtualização
- empreendedorismo
- inteligência artificial

## Sistema de palavras

As palavras são escolhidas de forma aleatória durante a partida.

O sistema também evita repetir algumas palavras utilizadas recentemente, deixando as partidas mais variadas.

A dificuldade pode aumentar de acordo com o desempenho do jogador.

## Armazenamento

O projeto utiliza o **LocalStorage** do navegador para armazenar informações do jogador, como:

- Nome
- Avatar
- Recorde pessoal
- Histórico de partidas
- Ranking

Dessa forma, algumas informações continuam disponíveis mesmo depois de atualizar a página.

## Como executar o projeto

Primeiro, clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
