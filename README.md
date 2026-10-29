# Inteligência Médica

Inteligência médica, não artificial.

Você médico, saia do chat gpt e venha aprender o que importa.

Sistema próprio, código próprio, sem dependências (Node 22). Uma sala única de aula ao vivo com áudio, vídeo, tela compartilhada e bate-papo por link, trilha de 12 aulas do básico ao avançado e perguntas do médico para o mestre.

## O que tem na v2

- Início com o slogan e o link da sala para copiar e enviar ao aluno.
- Aulas: 12 aulas em 3 níveis (Básico, Intermediário, Avançado), com objetivo, tópicos, exemplo, exercício, narração em áudio pelo navegador e progresso salvo no navegador.
- Sala de Aula: uma sala só (`/#sala`). Só entra quem tem conta aprovada pelo professor (ver Cadastro). Aluno entra com nome, câmera e microfone ou só no bate-papo. Vídeo de pessoa para pessoa (WebRTC, sinalização própria via WebSocket), compartilhar tela, levantar a mão e bate-papo salvo. O código compartilhado anterior (SALA_LOGIN/SALA_SENHA) foi desativado na v2, porque contornaria a aprovação do professor.
- Fundos da sala: 6 fundos limpos e brancos, todos com medicina e tecnologia juntos (Branco Clínico, Coração Digital, DNA e Tecnologia, Consultório Futuro, IA que Cuida, Céu Médico). O professor escolhe o fundo e ele fica atrás do vídeo na tela da aula.
- Pergunte ao Mestre — Tire suas dúvidas: o médico preenche tudo, incluindo o e-mail, e envia a dúvida. A dúvida só aparece publicada depois que o professor responder com resposta, pelo menos uma fonte científica, cruzamento de dados e confiança. Sem esses campos, a API recusa a publicação. O professor pode gerar um rascunho só com Gemini Lite (cache, parada em 429, sem chave nenhum rascunho é inventado) e precisa revisar e aprovar antes de publicar. Todas as dúvidas são notificadas para MH.cuidarsaude@gmail.com e a resposta publicada é enviada diretamente para o e-mail informado no formulário — envio automático só com EMAIL_WEBHOOK_URL configurado; sem ele, o sistema registra como pendente e o professor responde direto pelo e-mail do usuário (botão na área do professor), sem fingir envio. O e-mail do usuário nunca aparece na lista pública, só na área do professor.
- v3 — Assuntos e Banco de Perguntas e Respostas: 12 assuntos (Fundamentos, Prompts, Privacidade/LGPD/ética, Anamnese, Diferencial, Exames, Documentos, Protocolos, Auditoria, Fluxo da clínica, Comunicação, Gestão e ensino), cada um com descrição, tópicos, aulas relacionadas e palavras-chave, em `conteudo-v3.mjs`. Banco com 24 perguntas e respostas de metodologia de IA médica, cada uma com fonte, cruzamento de dados, confiança, tags e aula relacionada, pesquisável por palavra, assunto e nível (`/api/assuntos`, `/api/banco-perguntas`). Toda dúvida publicada entra automaticamente no banco, e o professor cadastra novas perguntas na área dele, com a mesma régua (sem fonte, cruzamento e confiança, não entra). A base de dados no servidor (`data/dados.json`) agora guarda usuários, professores, dúvidas, mensagens e o banco completo, com migração automática para bancos antigos.
- Cadastro e aprovação: página de Cadastro com nome completo, e-mail, CRM, UF, especialidade, telefone e senha (scrypt, mínimo 8 caracteres). A conta nasce pendente: precisa confirmar o e-mail (link com token) e ser aprovada pelo professor. Sem e-mail confirmado e sem aprovação, o login é recusado e a sala não abre. Envio de e-mail: sem provedor configurado (EMAIL_WEBHOOK_URL), o sistema avisa honestamente e o professor valida o e-mail na área de aprovação — nenhum envio é fingido.
- Área do Professor: primeira conta criada uma única vez na página, depois só login (sessão 12h). Lá o professor aprova, rejeita e valida e-mails de cadastros, e responde e publica dúvidas.

## Rodar

```bash
node server.mjs
```

Porta: `PORT` (padrão 3105). Dados em `DATA_DIR` (padrão `data/`): perguntas e mensagens da sala. Aulas ficam no código, não se perdem num redeploy.

## Regra da casa

A IA apoia, o médico decide. Nenhuma saída de IA vira conduta sem revisão, fonte e assinatura do médico.

Contato somente por MH.CUIDAR@ICLOUD.COM
