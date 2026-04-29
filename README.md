# Message App

![presentation project](https://github.com/HickAndrade/message-app/assets/47418499/1603cf2b-082e-4a92-b966-fde39dabdf1e)

Projeto de mensagens em tempo real refatorado de um BFF em `Next.js` para uma arquitetura separada em `web + api`, com foco em confiabilidade no backend, limites mais claros e um comportamento operacional mais robusto.

## Visão Geral

<div align="center">
  <h4>Tecnologias Utilizadas</h4>
  <img width="45" align="center" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/fastify.png" alt="Fastify" title="Fastify"/>
  <img align="center" alt="stack-icons" src="https://skillicons.dev/icons?i=next,ts,react,tailwind,prisma,nodejs,figma">
  <p>E mais algumas...</p>
</div>


- `web/`: aplicação Next.js e camada consumidora da API
- `api/`: API em Fastify com Prisma, MongoDB, serviços modulares e testes de integração
- `Pusher`: transporte realtime atual
- `Outbox`: entrega durável de eventos entre a persistência e a publicação em tempo real

Este repositório se tornou uma refatoração de legado usada para estudar:

- extração do backend para fora de um BFF
- escritas idempotentes
- entrega assíncrona de efeitos colaterais
- trade-offs de arquitetura realtime
- observabilidade e fortalecimento da aplicação

## O que mudou

O projeto original tratava a maior parte das responsabilidades de backend dentro da camada Next.js.

A versão atual move a responsabilidade central do backend para `api/`, onde o sistema agora controla:

- autenticação com cookies JWT
- serviços e repositórios em nível de módulo
- criação idempotente de mensagens com `clientMessageId`
- entrega assíncrona baseada em outbox
- correlação de requisições e logs estruturados
- rate limiting básico para rotas sensíveis e com alta carga de escrita

O Pusher ainda existe, mas seu papel agora é mais restrito:

- ele é o transporte realtime atual
- ele não é a fonte da verdade
- ele não faz parte da decisão de sucesso do caminho síncrono de escrita

## Fluxo de demonstração


### 1. Enviar uma mensagem e receber uma atualização em tempo real

`[Espaço reservado para GIF: docs/assets/send-message-realtime.gif]`
<img width="800" height="450" alt="send-message-realtime" src="https://github.com/user-attachments/assets/45f9f542-04c3-4e69-8ac2-c17b30be13cd" />

Nos bastidores:

- o cliente envia `POST /messages` com `clientMessageId`
- a API persiste a mensagem
- a API grava um evento no outbox
- o dispatcher publica o evento para baixo na cadeia
- o Pusher entrega a atualização em tempo real para os clientes conectados

### 2. Repetir a mesma mensagem com segurança

<img width="800" height="450" alt="send-message-idempotency" src="https://github.com/user-attachments/assets/bdb25c49-0445-413a-9308-123b25185e1f" />

Nos bastidores:

- as tentativas de repetição usam o mesmo `clientMessageId`
- o backend faz a deduplicação com base em `senderId + conversationId + clientMessageId`
- o fluxo de escrita evita criar mensagens duplicadas

### 3. Criar ou reutilizar uma conversa

<img width="800" height="450" alt="create-conversation-flow" src="https://github.com/user-attachments/assets/47ca8472-cefc-417e-b31b-a66ada7a8cc3" />

Nos bastidores:

- a API cria uma conversa direta/em grupo ou reutiliza uma já existente
- o backend enfileira o evento de chat correspondente
- a lista de conversas pode ser atualizada sem acoplar a persistência à entrega realtime

## Destaques do backend

- autenticação controlada pela API com cookies JWT
- validação de requisições e separação por módulos
- fluxo durável com outbox para eventos de chat
- logs estruturados em torno da entrega assíncrona
- correlação de requisições com `requestId`
- rate limiting em rotas sensíveis e com alta carga de escrita
- testes de integração com injeção do Fastify

## Visão geral da arquitetura

### Módulos atuais

- `auth`
- `users`
- `conversations`
- `messages`
- `outbox`
- `realtime`

### Responsabilidades atuais do backend

- controlar os limites de sessão/autenticação
- persistir escritas de domínio
- proteger o fluxo de escrita contra tentativas duplicadas do cliente
- enfileirar efeitos colaterais em vez de publicá-los inline
- entregar eventos realtime de forma assíncrona
- expor um contrato mais fino e explícito para o frontend

## Decisões principais

### Fastify em vez de um framework mais pesado

O Fastify mantém a composição explícita e leve, o que facilitou o estudo de:

- limites entre plugins
- ligação entre módulos
- composição de infraestrutura
- controle da configuração de testes

### Idempotência antes do outbox

O fluxo de escrita de mensagens foi fortalecido primeiro para que tentativas repetidas do cliente não duplicassem mensagens persistidas.

### Outbox antes de mudanças mais profundas no realtime

O projeto ainda usa o Pusher como transporte, mas agora o backend controla a durabilidade e a orquestração da entrega. Isso torna uma futura substituição do transporte muito mais realista.

### Fortalecimento em pequenas fases

O backend evoluiu de forma incremental em vez de ser reescrito de uma só vez:

- extração da autenticação
- abstração do publisher
- idempotência
- entrega via outbox
- correlação de requisições e logs
- rate limiting

## Estrutura do repositório

- [api/](./api): backend Fastify, schema do Prisma, módulos, testes e notas do backend
- [web/](./web): frontend em Next.js e camada atual de proxy/consumo da API

## Executando localmente

A partir da raiz do repositório:

```bash
npm install
npm run dev
```

Nesse fluxo, `web` e `api` rodam localmente. A API continua exigindo uma `DATABASE_URL` válida para um MongoDB externo com replica set já disponível.

Use [api/.env.example](./api/.env.example) como referência para configurar a conexão com o banco e os demais segredos do backend.

## Docker local

O `docker-compose.yml` do projeto deve gerenciar apenas `api` e `web`. O MongoDB não é provisionado pelo repositório.

Antes de subir os containers, deixe a `DATABASE_URL` já disponível no ambiente do Docker Compose, como uma variável exportada no shell ou definida no arquivo `.env` da raiz do repositório. O fluxo Docker não lê `api/.env`.

A `DATABASE_URL` deve apontar para um MongoDB externo pronto para uso e compatível com os requisitos de transação do Prisma no MongoDB.

```bash
npm run docker:up
npm run docker:down
```

`docker:down` derruba apenas os containers da stack local e não remove dados de um banco externo.
