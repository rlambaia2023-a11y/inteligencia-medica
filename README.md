# Inteligência Médica

Inteligência médica, não artificial.

Você médico, saia do chat gpt e venha aprender o que importa.

Sistema próprio, código próprio, sem dependências (Node 22). Uma sala única de aula ao vivo com áudio, vídeo, tela compartilhada e bate-papo por link, trilha de 12 aulas do básico ao avançado e perguntas do médico para o mestre.

## O que tem na v1

- Início com o slogan e o link da sala para copiar e enviar ao aluno.
- Aulas: 12 aulas em 3 níveis (Básico, Intermediário, Avançado), com objetivo, tópicos, exemplo, exercício, narração em áudio pelo navegador e progresso salvo no navegador.
- Sala de Aula: uma sala só (`/#sala`), fechada por login e senha compartilhados. Aluno entra primeiro com o login e a senha informados pelo professor, depois com nome, câmera e microfone ou só no bate-papo. Vídeo de pessoa para pessoa (WebRTC, sinalização própria via WebSocket), compartilhar tela, levantar a mão e bate-papo salvo. O login e a senha ficam só nas variáveis de ambiente `SALA_LOGIN` e `SALA_SENHA` do serviço — nunca no código nem no repositório público. Sem essas variáveis, a sala fica fechada.
- Fundos da sala: 6 fundos limpos e brancos, todos com medicina e tecnologia juntos (Branco Clínico, Coração Digital, DNA e Tecnologia, Consultório Futuro, IA que Cuida, Céu Médico). O professor escolhe o fundo e ele fica atrás do vídeo na tela da aula.
- Pergunte ao Mestre: o médico pergunta e o mestre responde na mesma página.

## Rodar

```bash
node server.mjs
```

Porta: `PORT` (padrão 3105). Dados em `DATA_DIR` (padrão `data/`): perguntas e mensagens da sala. Aulas ficam no código, não se perdem num redeploy.

## Regra da casa

A IA apoia, o médico decide. Nenhuma saída de IA vira conduta sem revisão, fonte e assinatura do médico.

Contato somente por MH.CUIDAR@ICLOUD.COM
