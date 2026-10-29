// Inteligência Médica v3 — código próprio, sem dependências.
// Uma sala única de aula ao vivo (áudio, vídeo e bate-papo por link),
// trilha do básico ao avançado e perguntas do médico para o mestre.
// Regras vigentes: pt-BR, sem inventar link, horário ou envio, e a IA
// aqui apoia o médico — nunca decide no lugar dele.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3105;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "dados.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const SALA = "sala";
import { ASSUNTOS, BANCO } from "./conteudo-v3.mjs";

const AULAS = [
  { id: 1, nivel: "Básico", numero: "Aula 1", titulo: "O que é Inteligência Médica (e o que ela não é)", duracao: "Aula ao vivo + leitura",
    objetivo: "Entender por que sair do ChatGPT genérico e aprender o que realmente importa na prática médica.",
    resumo: "Inteligência Médica não é decorar ferramenta. É saber usar a IA com critério clínico, fonte verificável e responsabilidade. O médico continua sendo quem decide.",
    topicos: ["A diferença entre uma resposta genérica e uma resposta clínica útil", "O que a IA faz bem: organizar, resumir, comparar e rascunhar", "O que a IA não faz: examinar, diagnosticar sozinha e assumir responsabilidade", "A regra de ouro: toda saída da IA passa pela revisão do médico"],
    exemplo: "Pergunta genérica: “o que é diabetes?”. Pergunta médica: “organize os critérios diagnósticos de diabetes segundo a diretriz atual, com fonte, e sinalize o que está incerto”. A segunda exige revisão, não cópia.",
    exercicio: "Pegue uma resposta genérica que você já recebeu de uma IA e marque: o que é útil, o que é vago e o que precisaria de fonte antes de usar com um paciente." },
  { id: 2, nivel: "Básico", numero: "Aula 2", titulo: "Como a IA “pensa”: dados, padrões e limites", duracao: "Aula ao vivo + leitura",
    objetivo: "Entender, sem jargão, por que a IA acerta, erra e às vezes inventa com segurança.",
    resumo: "A IA reconhece padrões em textos. Ela não viu o seu paciente. Por isso pode soar convincente e estar errada — e o médico precisa saber onde desconfiar.",
    topicos: ["Padrão não é evidência: semelhança com o texto não prova verdade clínica", "Alucinação: quando a IA completa o que falta com algo plausível, não real", "Viés de dado: o que faltou no treino aparece como erro na prática", "Confiança não é certeza: resposta firme não é resposta correta"],
    exemplo: "Se a IA cita uma diretriz, confira: a diretriz existe? É a versão atual? Ela diz mesmo aquilo? Três checagens, um minuto, evitam um erro grave.",
    exercicio: "Peça a uma IA uma referência bibliográfica e confira se o artigo existe de verdade. Anote o que encontrou." },
  { id: 3, nivel: "Básico", numero: "Aula 3", titulo: "Seu primeiro prompt clínico seguro", duracao: "Aula ao vivo + prática",
    objetivo: "Escrever um pedido claro para a IA: contexto, tarefa, formato e checagem.",
    resumo: "Prompt bom não é mágica. É contexto anonimizado, tarefa única, formato pedido e um pedido explícito de sinalizar incerteza e fonte.",
    topicos: ["A estrutura: contexto + tarefa + formato + checagem", "Anonimizar sempre: sem nome, documento, foto identificável ou dado raro", "Uma tarefa por vez: misturar tudo piora tudo", "Pedir fonte e incerteza: “cite a fonte e diga o que não está confirmado”"],
    exemplo: "“Organize este relato anonimizado em queixa, história e exame. Liste hipóteses com a favor e contra, sem fechar diagnóstico. Cite fontes oficiais e sinalize o incerto.”",
    exercicio: "Reescreva um pedido que você já fez a uma IA usando a estrutura desta aula. Compare a qualidade das duas respostas." },
  { id: 4, nivel: "Básico", numero: "Aula 4", titulo: "Privacidade e LGPD na prática: o que nunca colar numa IA", duracao: "Aula ao vivo + leitura",
    objetivo: "Proteger o paciente antes de qualquer ganho de velocidade.",
    resumo: "Dado de paciente em IA pública pode virar dado vazado. A regra é simples: se identifica alguém, não vai para a IA sem anonimizar e sem base legal e consentimento adequados.",
    topicos: ["O que identifica: nome, documento, foto, data rara, combinação de detalhes", "IA pública não é prontuário: não cole prontuário, exame com nome ou conversa de paciente", "Anonimização de verdade, não só tirar o nome", "Quando não usar IA: o caso sensível pede o caminho tradicional"],
    exemplo: "Antes de colar um relato, retire nome, idade exata se rara, cidade pequena, datas e qualquer detalhe que, junto, identifique a pessoa.",
    exercicio: "Pegue um relato fictício e anonimizado e marque tudo o que você removeria antes de usar uma IA pública." },
  { id: 5, nivel: "Intermediário", numero: "Aula 5", titulo: "Anamnese e registro: organizar sem perder o humano", duracao: "Aula ao vivo + prática",
    objetivo: "Usar a IA para organizar o relato, mantendo escuta, exame e decisão com o médico.",
    resumo: "A IA organiza bem: queixa, história, exame, hipóteses e plano em rascunho. O médico escuta, examina, corrige e assina. Nada do registro final sai sem revisão.",
    topicos: ["Do relato solto ao registro estruturado", "O que a IA não pode preencher: o que só o exame e a escuta revelam", "Rascunho, revisão, assinatura: o fluxo em três passos", "Linguagem do prontuário: clara, objetiva e sem exagero"],
    exemplo: "Relato solto vira: queixa principal, história da doença atual, antecedentes, exame físico, hipóteses com a favor e contra, plano. Cada item revisado pelo médico.",
    exercicio: "Organize um caso fictício com a IA e depois corrija à mão tudo o que ela assumiu sem base no relato." },
  { id: 6, nivel: "Intermediário", numero: "Aula 6", titulo: "Raciocínio diferencial com IA: hipóteses, a favor e contra", duracao: "Aula ao vivo + prática",
    objetivo: "Usar a IA para abrir o diferencial, não para fechar o caso antes da hora.",
    resumo: "Bom diferencial lista hipóteses plausíveis, diz o que apoia e o que afasta cada uma, e aponta o próximo dado que decide. Fechar cedo é o erro mais caro.",
    topicos: ["Listar antes de escolher: até 5 hipóteses ranqueadas", "A favor e contra, com base no caso — não no genérico", "O próximo exame que muda a conduta, e por quê", "Quando o caso sai do escopo: encaminhar, não forçar resposta"],
    exemplo: "Para cada hipótese, exija: o que neste caso apoia, o que afasta, e qual dado falta para decidir. Sem isso, é lista bonita, não raciocínio.",
    exercicio: "Monte um diferencial de um caso fictício e risque as hipóteses que a IA listou sem apoio no relato." },
  { id: 7, nivel: "Intermediário", numero: "Aula 7", titulo: "Exames e condutas: pedir, interpretar, checar fonte", duracao: "Aula ao vivo + prática",
    objetivo: "Pedir exame com motivo, interpretar com contexto e checar a fonte antes de agir.",
    resumo: "Exame sem motivo vira custo e confusão. A IA ajuda a justificar o pedido, interpretar o resultado no contexto e lembrar o que confirmar na diretriz.",
    topicos: ["Pedir com motivo: o que este exame muda na conduta?", "Interpretar no contexto: número isolado não decide nada", "Checar a fonte: diretriz atual, não resumo de resumo", "Resultado inesperado: repetir, confirmar ou investigar — com critério"],
    exemplo: "Antes de pedir, responda: se der positivo, mudo a conduta? Se der negativo, descarto o quê? Se a resposta for “nada”, repense o pedido.",
    exercicio: "Escolha um exame comum e escreva, com ajuda da IA e checagem de fonte, quando pedir, o que ele muda e o que não prova." },
  { id: 8, nivel: "Intermediário", numero: "Aula 8", titulo: "Prescrição, laudo e documentos: rascunho, revisão e assinatura", duracao: "Aula ao vivo + prática",
    objetivo: "Usar a IA como rascunho de documento, com revisão e assinatura sempre do médico.",
    resumo: "Rascunho pode vir da IA. Documento final, nunca sem revisão: dose, interação, alergia, contraindicação e clareza para quem vai ler. Quem assina é o médico.",
    topicos: ["Rascunho não é documento: a revisão é obrigatória", "Checklist antes de assinar: dose, interação, alergia, duração, orientação", "Linguagem para o paciente: clara, sem jargão desnecessário", "Registro do que foi revisado: o que mudou e por quê"],
    exemplo: "Receita rascunhada pela IA passa por: dose certa para este paciente? Interação com o que ele já usa? Alergia? Orientação clara de uso? Só então assina.",
    exercicio: "Pegue um documento rascunhado por IA e faça a revisão completa, marcando cada correção." },
  { id: 9, nivel: "Avançado", numero: "Aula 9", titulo: "Protocolos e diretrizes: a IA dentro do protocolo, não acima dele", duracao: "Aula ao vivo + leitura",
    objetivo: "Colocar a IA para trabalhar dentro de protocolos salvos e fontes oficiais, sem inventar referência.",
    resumo: "Protocolo manda, IA executa dentro dele. Referência só vale se for de protocolo salvo ou fonte oficial — e, sem referência segura, a resposta honesta é dizer que não há.",
    topicos: ["Protocolo primeiro: a IA segue o protocolo da clínica, não o improvisa", "Fonte oficial ou nada: sem fonte segura, lista vazia — não inventada", "Atualização de protocolo: quem revisa, quando e como registra", "Exceção ao protocolo: documentada, justificada e assinada pelo médico"],
    exemplo: "Pergunta respondida com protocolo salvo: resposta + trecho do protocolo + fonte. Pergunta sem protocolo: resposta sinalizada como não confirmada, com o caminho para confirmar.",
    exercicio: "Escolha um protocolo da sua prática e escreva como a IA deve usá-lo — e onde ela deve parar e chamar o médico." },
  { id: 10, nivel: "Avançado", numero: "Aula 10", titulo: "Auditoria da IA: quando ela erra, como detectar e corrigir", duracao: "Aula ao vivo + prática",
    objetivo: "Criar o hábito de auditar a IA: checar fonte, lógica e dado antes de confiar.",
    resumo: "Auditar é rotina, não desconfiança ocasional: fonte existe? Lógica fecha com o caso? Dado foi inventado? Três perguntas que salvam condutas.",
    topicos: ["Auditoria em 3 perguntas: fonte, lógica, dado", "Erros típicos: referência falsa, dose errada, generalização indevida", "Registrar o erro: o que a IA errou, como foi detectado, o que mudou", "Feedback para a equipe: o erro de um vira aprendizado de todos"],
    exemplo: "Auditoria rápida de uma resposta: 1) a fonte existe e é atual? 2) cada afirmação tem base no caso? 3) algum número apareceu sem origem? Um “não” já pede correção.",
    exercicio: "Audite três respostas de IA e registre os erros encontrados, por tipo." },
  { id: 11, nivel: "Avançado", numero: "Aula 11", titulo: "Fluxo completo na clínica: do atendimento ao follow-up com IA", duracao: "Aula ao vivo + prática",
    objetivo: "Montar um fluxo real: atendimento, registro, documento, orientação e retorno — com IA em cada etapa, sob revisão.",
    resumo: "O ganho não está numa resposta isolada, e sim no fluxo: preparar, atender, registrar, orientar e acompanhar, com a IA acelerando o repetitivo e o médico decidindo o clínico.",
    topicos: ["Antes: preparar o atendimento com resumo do caso", "Durante: registrar sem perder a escuta", "Depois: documento, orientação e lembrete de retorno", "Follow-up: o que acompanhar, quando chamar de volta, o que registrar"],
    exemplo: "Fluxo de uma consulta: resumo prévio, registro estruturado, documento revisado, orientação clara ao paciente e retorno agendado com motivo. IA em tudo, decisão em nada sozinha.",
    exercicio: "Desenhe o fluxo da sua consulta com IA em cada etapa e marque onde só o médico decide." },
  { id: 12, nivel: "Avançado", numero: "Aula 12", titulo: "Do consultório ao ensino: ensinar equipe e pacientes com IA", duracao: "Aula ao vivo + projeto final",
    objetivo: "Transformar o aprendizado em ensino: treinar a equipe e orientar pacientes com material claro e seguro.",
    resumo: "Quem domina ensina: material para a equipe, orientação para o paciente e uma aula sua sobre um tema da sua prática. Projeto final: uma aula completa, do roteiro à revisão.",
    topicos: ["Ensinar a equipe: rotina, checklist e auditoria compartilhada", "Orientar o paciente: material claro, sem prometer o que a IA não garante", "Sua aula: roteiro, exemplo, exercício e revisão", "Projeto final: apresente sua aula na sala ao vivo"],
    exemplo: "Projeto final: escolha um tema da sua prática, monte roteiro, exemplo e exercício no padrão das aulas, e apresente na sala para os colegas.",
    exercicio: "Projeto final: entregue o roteiro da sua aula. Na sala ao vivo, você apresenta e recebe perguntas dos colegas." },
];

function seed() { return { perguntas: [], mensagens: [], contador: 100, usuarios: [], professores: [], duvidas: [], bancoPerguntas: JSON.parse(JSON.stringify(BANCO)) }; }
function carregar() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) { const d = seed(); fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); return d; }
  try { const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); if (!Array.isArray(d.perguntas)) d.perguntas = []; if (!Array.isArray(d.mensagens)) d.mensagens = []; if (!d.contador) d.contador = 1; if (!Array.isArray(d.usuarios)) d.usuarios = []; if (!Array.isArray(d.professores)) d.professores = []; if (!Array.isArray(d.duvidas)) d.duvidas = []; if (!Array.isArray(d.bancoPerguntas)) d.bancoPerguntas = JSON.parse(JSON.stringify(BANCO)); if (!d.contador || d.contador < 100) d.contador = 100; return d; }
  catch { return seed(); }
}
let db = carregar();
function salvar() { try { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); } catch {} }
// Acesso v2: a sala só abre para conta aprovada pelo professor.
// Cadastro -> verificação de e-mail (token) -> aprovação do professor ->
// login. Sem conta aprovada e e-mail verificado, não há entrada na sala.
// Senhas guardadas só com scrypt (sal+hash), nunca em texto aberto.
// Sessões em memória por cookie HttpOnly (12h); reiniciar o servidor
// encerra os logins, o que é seguro. Cada entrada na sala gera um token
// de sala em memória, usado no WebSocket e no bate-papo por REST.
// O código compartilhado anterior (SALA_LOGIN/SALA_SENHA) foi desativado
// na v2: ele contornaria a aprovação do professor.
const salaTokens = new Set();
const sessoesUsuario = new Map();
const sessoesProf = new Map();
const MODELO_IA = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
// Todas as dúvidas vão para este e-mail (notificação ao professor), e a
// resposta publicada vai diretamente para o e-mail informado no formulário.
// Envio real só acontece com EMAIL_WEBHOOK_URL configurado; sem ele, o
// sistema registra a notificação como pendente e o professor responde
// direto pelo e-mail do usuário, sem fingir envio.
const EMAIL_NOTIFICACAO_DUVIDAS = "MH.cuidarsaude@gmail.com";
async function notificarEmail(para, assunto, texto) {
  if (!process.env.EMAIL_WEBHOOK_URL) return { enviado: false, motivo: "Envio de e-mail não configurado no servidor (falta EMAIL_WEBHOOK_URL)." };
  try { const r = await fetch(process.env.EMAIL_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ para, assunto, texto }) }); return { enviado: r.ok, motivo: r.ok ? "" : "Provedor de e-mail devolveu erro." }; }
  catch { return { enviado: false, motivo: "Falha ao chamar o provedor de e-mail." }; }
}
const cacheRascunho = new Map();
function hashSenha(senha) { const sal = crypto.randomBytes(16).toString("hex"); return `scrypt:${sal}:${crypto.scryptSync(senha, sal, 64).toString("hex")}`; }
function verificarSenha(senha, armazenado) { try { const [, sal, hash] = armazenado.split(":"); return crypto.timingSafeEqual(crypto.scryptSync(senha, sal, 64), Buffer.from(hash, "hex")); } catch { return false; } }
function lerCookie(req, nome) { const cab = req.headers.cookie || ""; const item = cab.split(";").map((s) => s.trim()).find((s) => s.startsWith(nome + "=")); return item ? decodeURIComponent(item.slice(nome.length + 1)) : ""; }
function sessaoValida(mapa, req, nomeCookie) { const token = lerCookie(req, nomeCookie); if (!token) return null; const s = mapa.get(token); if (!s || s.expiraEm < Date.now()) { mapa.delete(token); return null; } return s; }
function usuarioDaSessao(req) { const s = sessaoValida(sessoesUsuario, req, "sessao_usuario"); if (!s) return null; return db.usuarios.find((u) => u.id === s.usuarioId) || null; }
function profDaSessao(req) { const s = sessaoValida(sessoesProf, req, "sessao_prof"); if (!s) return null; return db.professores.find((p) => p.id === s.profId) || null; }
function usuarioPublico(u) { if (!u) return null; const { senhaHash, tokenVerificacao, ...pub } = u; return pub; }
function definirCookie(res, nome, token) { res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": `${nome}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${12 * 60 * 60}` }); }
function limparCookie(res, nome) { res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": `${nome}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0` }); }
function lerCorpo(req) {
  return new Promise((resolve) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { try { resolve(b ? JSON.parse(b) : {}); } catch { resolve({}); } }); });
}
function enviar(res, status, obj) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }); res.end(JSON.stringify(obj)); }
function limpo(s, max = 1000) { return String(s || "").trim().slice(0, max); }

// ---- WebSocket manual (sem dependências): sinalização WebRTC + chat ao vivo ----
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const peers = new Map(); // peerId -> { socket, sala, nome, papel }
function wsFrame(texto) {
  const payload = Buffer.from(texto, "utf8");
  let cab;
  if (payload.length < 126) { cab = Buffer.alloc(2); cab[1] = payload.length; }
  else if (payload.length < 65535) { cab = Buffer.alloc(4); cab[1] = 126; cab.writeUInt16BE(payload.length, 2); }
  else { cab = Buffer.alloc(10); cab[1] = 127; cab.writeBigUInt64BE(BigInt(payload.length), 2); }
  cab[0] = 0x81;
  return Buffer.concat([cab, payload]);
}
function wsEnviar(socket, obj) { try { socket.write(wsFrame(JSON.stringify(obj))); } catch {} }
function wsParaSala(sala, obj, exceto) {
  for (const [id, p] of peers) if (p.sala === sala && id !== exceto) wsEnviar(p.socket, obj);
}
function wsProcessar(socket, estado, chunk) {
  estado.buf = Buffer.concat([estado.buf, chunk]);
  while (estado.buf.length >= 2) {
    const b0 = estado.buf[0], b1 = estado.buf[1];
    const opcode = b0 & 0x0f;
    let len = b1 & 0x7f, off = 2;
    if (len === 126) { if (estado.buf.length < 4) return; len = estado.buf.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (estado.buf.length < 10) return; len = Number(estado.buf.readBigUInt64BE(2)); off = 10; }
    const mascarado = (b1 & 0x80) !== 0;
    const chaveOff = off; off += mascarado ? 4 : 0;
    if (estado.buf.length < off + len) return;
    let payload = Buffer.from(estado.buf.subarray(off, off + len));
    if (mascarado) { const chave = estado.buf.subarray(chaveOff, chaveOff + 4); for (let i = 0; i < payload.length; i++) payload[i] ^= chave[i % 4]; }
    estado.buf = Buffer.from(estado.buf.subarray(off + len));
    if (opcode === 8) { try { socket.end(); } catch {} return; }
    if (opcode === 9) { try { socket.write(Buffer.from([0x8a, 0x00])); } catch {} continue; }
    if (opcode !== 1) continue;
    let msg; try { msg = JSON.parse(payload.toString("utf8")); } catch { continue; }
    if (msg.type === "join" && !estado.peerId) {
      if (!salaTokens.has(msg.token)) { wsEnviar(socket, { type: "erro", mensagem: "Entre na sala com uma conta aprovada pelo professor." }); setTimeout(() => { try { socket.destroy(); } catch {} }, 100); return; }
      const peerId = crypto.randomUUID();
      estado.peerId = peerId; estado.sala = SALA; estado.nome = limpo(msg.nome, 80) || "Aluno";
      const existentes = [...peers.values()].filter((p) => p.sala === SALA).map((p) => ({ peerId: p.peerId, nome: p.nome, papel: p.papel }));
      peers.set(peerId, { socket, sala: SALA, nome: estado.nome, papel: limpo(msg.papel, 20) || "aluno", peerId });
      wsEnviar(socket, { type: "welcome", peerId, peers: existentes, historico: db.mensagens.slice(-50) });
      wsParaSala(SALA, { type: "peer-joined", peerId, nome: estado.nome }, peerId);
    } else if (msg.type === "signal" && estado.peerId && msg.to) {
      const destino = peers.get(msg.to);
      if (destino) wsEnviar(destino.socket, { type: "signal", from: estado.peerId, data: msg.data });
    } else if (msg.type === "chat" && estado.peerId) {
      const texto = limpo(msg.texto, 500); if (!texto) continue;
      const m = { id: db.contador++, nome: estado.nome, texto, em: new Date().toISOString() };
      db.mensagens.push(m); if (db.mensagens.length > 200) db.mensagens = db.mensagens.slice(-200); salvar();
      wsParaSala(SALA, { type: "chat", mensagem: m });
    } else if (msg.type === "mao" && estado.peerId) {
      wsParaSala(SALA, { type: "chat", mensagem: { id: 0, nome: "Sala", texto: `✋ ${estado.nome} levantou a mão para perguntar.`, em: new Date().toISOString(), sistema: true } });
    }
  }
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8" };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const rota = url.pathname;
  if (rota === "/api/health") return enviar(res, 200, { ok: true, servico: "inteligencia-medica", versao: "v3", aulas: AULAS.length, assuntos: ASSUNTOS.length, bancoPerguntas: db.bancoPerguntas.length, perguntas: db.perguntas.length, duvidasPublicadas: db.duvidas.filter((d) => d.publicada).length, usuarios: db.usuarios.length, usuariosAprovados: db.usuarios.filter((u) => u.status === "aprovado").length, mensagens: db.mensagens.length, ia_configurada: Boolean(process.env.GEMINI_API_KEY), modelo_ia: MODELO_IA, onlineNaSala: [...peers.values()].filter((p) => p.sala === SALA).length });
  if (rota === "/api/aulas") return enviar(res, 200, { ok: true, aulas: AULAS });
  // v3 — Assuntos e Banco de Perguntas e Respostas (base de dados elaborada).
  if (req.method === "GET" && rota === "/api/assuntos") return enviar(res, 200, { ok: true, assuntos: ASSUNTOS.map((a) => ({ ...a, perguntas: db.bancoPerguntas.filter((q) => q.assunto === a.id).length })) });
  if (req.method === "GET" && rota.startsWith("/api/assuntos/")) {
    const a = ASSUNTOS.find((x) => x.id === rota.split("/")[3]);
    if (!a) return enviar(res, 404, { ok: false, erro: "Assunto não encontrado." });
    return enviar(res, 200, { ok: true, assunto: a, perguntas: db.bancoPerguntas.filter((q) => q.assunto === a.id), aulas: AULAS.filter((x) => a.aulasRelacionadas.includes(x.id)) });
  }
  function filtrarBanco(q, assunto, nivel) {
    const termo = (q || "").toLowerCase();
    return db.bancoPerguntas.filter((x) => {
      if (assunto && x.assunto !== assunto) return false;
      if (nivel && nivel !== "Todos" && x.nivel !== nivel) return false;
      if (!termo) return true;
      return [x.pergunta, x.resposta, x.cruzamento, (x.tags || []).join(" "), x.assunto].join(" ").toLowerCase().includes(termo);
    });
  }
  if (req.method === "GET" && rota === "/api/banco-perguntas") {
    const lista = filtrarBanco(url.searchParams.get("q") || "", url.searchParams.get("assunto") || "", url.searchParams.get("nivel") || "");
    return enviar(res, 200, { ok: true, total: lista.length, perguntas: lista });
  }
  if (req.method === "GET" && rota.startsWith("/api/banco-perguntas/")) {
    const q = db.bancoPerguntas.find((x) => x.id === Number(rota.split("/")[3]));
    if (!q) return enviar(res, 404, { ok: false, erro: "Pergunta não encontrada no banco." });
    return enviar(res, 200, { ok: true, pergunta: q, assunto: ASSUNTOS.find((a) => a.id === q.assunto) || null });
  }
  if (req.method === "POST" && rota === "/api/professor/banco-perguntas") {
    if (!profDaSessao(req)) return enviar(res, 401, { ok: false, erro: "Área do professor: faça login." });
    const b = await lerCorpo(req);
    const fontes = String(b.fontes || "").split("\n").map((x) => x.trim()).filter(Boolean);
    if (!limpo(b.pergunta, 1000) || !limpo(b.resposta, 5000) || fontes.length < 1 || !limpo(b.cruzamento, 2000) || !limpo(b.confianca, 20)) return enviar(res, 400, { ok: false, erro: "Para entrar no banco, preencha pergunta, resposta, pelo menos uma fonte, cruzamento de dados e confiança." });
    const q = { id: db.contador++, assunto: limpo(b.assunto, 80) || "fundamentos", nivel: limpo(b.nivel, 20) || "Todos", pergunta: limpo(b.pergunta, 1000), resposta: limpo(b.resposta, 5000), fontes, cruzamento: limpo(b.cruzamento, 2000), confianca: limpo(b.confianca, 20), tags: String(b.tags || "").split(",").map((x) => x.trim()).filter(Boolean), aulaRelacionada: Number(b.aulaRelacionada) || null, origem: "professor", em: new Date().toISOString() };
    db.bancoPerguntas.push(q); salvar();
    return enviar(res, 201, { ok: true, pergunta: q });
  }
  if (rota === "/api/sala") return enviar(res, 200, { ok: true, sala: { codigo: SALA, titulo: "Sala de Aula — Inteligência Médica", acesso: "conta_aprovada", acessoProtegido: true, online: [...peers.values()].filter((p) => p.sala === SALA).map((p) => p.nome), link: "/#sala" }, mensagens: salaTokens.has(url.searchParams.get("token")) ? db.mensagens.slice(-50) : [] });
  // Entrada na sala só para conta aprovada (usuário) ou professor logado.
  if (req.method === "POST" && rota === "/api/sala/entrar-usuario") {
    const usuario = usuarioDaSessao(req);
    const prof = profDaSessao(req);
    if (!usuario && !prof) return enviar(res, 401, { ok: false, erro: "Faça login com uma conta aprovada para entrar na sala." });
    if (usuario && (usuario.status !== "aprovado" || !usuario.emailVerificado)) return enviar(res, 403, { ok: false, erro: "Sua conta ainda não foi aprovada pelo professor ou seu e-mail ainda não foi verificado." });
    const token = crypto.randomUUID();
    salaTokens.add(token);
    return enviar(res, 200, { ok: true, token, nome: usuario ? usuario.nome : "Professor", papel: usuario ? "aluno" : "professor" });
  }
  if (req.method === "GET" && rota === "/api/usuario/eu") {
    const u = usuarioDaSessao(req);
    return enviar(res, 200, { ok: true, logado: Boolean(u), usuario: usuarioPublico(u) });
  }
  if (req.method === "GET" && rota === "/api/professor/eu") {
    const p = profDaSessao(req);
    return enviar(res, 200, { ok: true, temConta: db.professores.length > 0, logado: Boolean(p), email: p?.email || "" });
  }
  if (req.method === "POST" && rota === "/api/cadastro") {
    const b = await lerCorpo(req);
    const nome = limpo(b.nome, 120), email = limpo(b.email, 120).toLowerCase(), crm = limpo(b.crm, 30), uf = limpo(b.uf, 5).toUpperCase(), esp = limpo(b.especialidade, 80), tel = limpo(b.telefone, 30);
    if (!nome || !email.includes("@") || !crm || !uf || !esp || !b.senha || String(b.senha).length < 8) return enviar(res, 400, { ok: false, erro: "Preencha nome completo, e-mail válido, CRM, UF, especialidade e uma senha com pelo menos 8 caracteres." });
    if (db.usuarios.find((u) => u.email === email)) return enviar(res, 409, { ok: false, erro: "Este e-mail já tem cadastro. Use a página Entrar." });
    const u = { id: db.contador++, nome, email, crm, uf, especialidade: esp, telefone: tel, senhaHash: hashSenha(String(b.senha)), emailVerificado: false, tokenVerificacao: crypto.randomUUID(), status: "pendente", criadoEm: new Date().toISOString(), aprovadoEm: "" };
    db.usuarios.push(u); salvar();
    // Envio de e-mail: honesto, sem fingir. Sem provedor configurado, o
    // token fica guardado e o professor valida o e-mail na aprovação.
    // Com EMAIL_WEBHOOK_URL, o link é enviado por esse provedor.
    let emailEnviado = false;
    if (process.env.EMAIL_WEBHOOK_URL) {
      try { const r = await fetch(process.env.EMAIL_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ para: email, assunto: "Confirme seu e-mail — Inteligência Médica", texto: `Olá ${nome}, confirme seu e-mail abrindo este link: /verificar?token=${u.tokenVerificacao}` }) }); emailEnviado = r.ok; } catch { emailEnviado = false; }
    }
    return enviar(res, 201, { ok: true, emailEnviado, mensagem: emailEnviado ? "Cadastro criado. Abra o link enviado para o seu e-mail e aguarde a aprovação do professor." : "Cadastro criado e aguardando validação. O envio de e-mail ainda não está configurado no servidor, então o professor valida seu e-mail e seu acesso na área de aprovação — sem isso, sua conta não entra na sala." });
  }
  if (req.method === "POST" && rota === "/api/verificar-email") {
    const b = await lerCorpo(req);
    const u = db.usuarios.find((x) => x.tokenVerificacao === limpo(b.token, 100));
    if (!u) return enviar(res, 404, { ok: false, erro: "Link de verificação inválido ou já usado." });
    u.emailVerificado = true; u.tokenVerificacao = ""; salvar();
    return enviar(res, 200, { ok: true, mensagem: "E-mail confirmado. Agora aguarde a aprovação do professor para entrar." });
  }
  if (req.method === "POST" && rota === "/api/login") {
    const b = await lerCorpo(req);
    const u = db.usuarios.find((x) => x.email === limpo(b.email, 120).toLowerCase());
    if (!u || !verificarSenha(String(b.senha || ""), u.senhaHash)) return enviar(res, 401, { ok: false, erro: "E-mail ou senha incorretos." });
    if (!u.emailVerificado) return enviar(res, 403, { ok: false, erro: "Confirme seu e-mail ou aguarde a validação do professor." });
    if (u.status !== "aprovado") return enviar(res, 403, { ok: false, erro: "Seu cadastro ainda está aguardando aprovação do professor." });
    const token = crypto.randomUUID(); sessoesUsuario.set(token, { usuarioId: u.id, expiraEm: Date.now() + 12 * 60 * 60 * 1000 });
    definirCookie(res, "sessao_usuario", token); return res.end(JSON.stringify({ ok: true, usuario: usuarioPublico(u) }));
  }
  if (req.method === "POST" && rota === "/api/logout") { sessoesUsuario.delete(lerCookie(req, "sessao_usuario")); limparCookie(res, "sessao_usuario"); return res.end(JSON.stringify({ ok: true })); }
  if (req.method === "POST" && rota === "/api/professor/cadastro") {
    const b = await lerCorpo(req);
    if (db.professores.length > 0) return enviar(res, 403, { ok: false, erro: "Já existe uma conta de professor. Use o login." });
    if (!limpo(b.email, 120).includes("@") || !b.senha || String(b.senha).length < 8) return enviar(res, 400, { ok: false, erro: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres." });
    db.professores.push({ id: db.contador++, email: limpo(b.email, 120).toLowerCase(), senhaHash: hashSenha(String(b.senha)), criadoEm: new Date().toISOString() }); salvar();
    return enviar(res, 201, { ok: true, mensagem: "Conta do professor criada. Faça login para aprovar cadastros e dúvidas." });
  }
  if (req.method === "POST" && rota === "/api/professor/login") {
    const b = await lerCorpo(req);
    const p = db.professores.find((x) => x.email === limpo(b.email, 120).toLowerCase());
    if (!p || !verificarSenha(String(b.senha || ""), p.senhaHash)) return enviar(res, 401, { ok: false, erro: "E-mail ou senha incorretos." });
    const token = crypto.randomUUID(); sessoesProf.set(token, { profId: p.id, expiraEm: Date.now() + 12 * 60 * 60 * 1000 });
    definirCookie(res, "sessao_prof", token); return res.end(JSON.stringify({ ok: true, email: p.email }));
  }
  if (req.method === "POST" && rota === "/api/professor/logout") { sessoesProf.delete(lerCookie(req, "sessao_prof")); limparCookie(res, "sessao_prof"); return res.end(JSON.stringify({ ok: true })); }
  if (req.method === "GET" && rota === "/api/professor/cadastros") {
    if (!profDaSessao(req)) return enviar(res, 401, { ok: false, erro: "Área do professor: faça login." });
    return enviar(res, 200, { ok: true, usuarios: db.usuarios.map(usuarioPublico).reverse() });
  }
  if (req.method === "POST" && rota.startsWith("/api/professor/cadastros/")) {
    if (!profDaSessao(req)) return enviar(res, 401, { ok: false, erro: "Área do professor: faça login." });
    const partes = rota.split("/"); const id = Number(partes[4]); const acao = partes[5];
    const u = db.usuarios.find((x) => x.id === id); if (!u) return enviar(res, 404, { ok: false, erro: "Cadastro não encontrado." });
    if (acao === "aprovar") { u.status = "aprovado"; u.aprovadoEm = new Date().toISOString(); }
    else if (acao === "rejeitar") { u.status = "rejeitado"; }
    else if (acao === "validar-email") { u.emailVerificado = true; u.tokenVerificacao = ""; }
    else return enviar(res, 400, { ok: false, erro: "Ação desconhecida." });
    salvar(); return enviar(res, 200, { ok: true, usuario: usuarioPublico(u) });
  }
  // Tire suas dúvidas: só dúvida publicada aparece para todos, e só com
  // resposta + fonte científica + cruzamento de dados, aprovada pelo professor.
  if (req.method === "GET" && rota === "/api/duvidas") {
    // Público: e-mail do usuário NUNCA aparece aqui, só na área do professor.
    return enviar(res, 200, { ok: true, duvidas: db.duvidas.filter((d) => d.publicada).map((d) => ({ id: d.id, nome: d.nome, especialidade: d.especialidade, duvida: d.duvida, resposta: d.resposta, fontes: d.fontes, cruzamento: d.cruzamento, confianca: d.confianca, publicada: d.publicada, em: d.em, respondidoEm: d.respondidoEm })).reverse() });
  }
  if (req.method === "POST" && rota === "/api/duvidas") {
    const b = await lerCorpo(req);
    if (!limpo(b.duvida, 2000)) return enviar(res, 400, { ok: false, erro: "Escreva a sua dúvida." });
    const usuario = usuarioDaSessao(req);
    const emailDuvida = limpo(b.email, 120).toLowerCase() || (usuario?.email || "");
    if (!emailDuvida.includes("@")) return enviar(res, 400, { ok: false, erro: "Informe seu e-mail no formulário: a resposta será enviada diretamente para ele." });
    const d = { id: db.contador++, nome: limpo(b.nome, 120) || (usuario?.nome || "Médico"), email: emailDuvida, especialidade: limpo(b.especialidade, 80) || (usuario?.especialidade || ""), duvida: limpo(b.duvida, 2000), usuarioId: usuario?.id || null, resposta: "", fontes: [], cruzamento: "", confianca: "", rascunhoIA: "", publicada: false, em: new Date().toISOString(), respondidoEm: "", notificacaoProfessor: { para: EMAIL_NOTIFICACAO_DUVIDAS, enviada: false, motivo: "" }, respostaEnviadaParaUsuario: false };
    db.duvidas.push(d);
    const notif = await notificarEmail(EMAIL_NOTIFICACAO_DUVIDAS, `Nova dúvida — Inteligência Médica (id ${d.id})`, `Nova dúvida recebida.\n\nDe: ${d.nome} (${d.email})\nEspecialidade: ${d.especialidade}\n\nDúvida:\n${d.duvida}\n\nResponda na área do professor (/#professor). A resposta publicada vai diretamente para ${d.email}.`);
    d.notificacaoProfessor = { para: EMAIL_NOTIFICACAO_DUVIDAS, enviada: notif.enviado, motivo: notif.motivo };
    salvar();
    return enviar(res, 201, { ok: true, duvida: { id: d.id, nome: d.nome, duvida: d.duvida, publicada: false }, notificacaoProfessorEnviada: notif.enviado, mensagem: notif.enviado ? "Dúvida enviada para o professor e, depois de aprovada, a resposta vai diretamente para o seu e-mail." : "Dúvida registrada e visível para o professor na área de aprovação. O envio automático por e-mail ainda não está configurado no servidor, então o professor responde diretamente pelo seu e-mail — sem isso, sua dúvida não fica sem resposta." });
  }
  if (req.method === "GET" && rota === "/api/professor/duvidas") {
    if (!profDaSessao(req)) return enviar(res, 401, { ok: false, erro: "Área do professor: faça login." });
    return enviar(res, 200, { ok: true, duvidas: [...db.duvidas].reverse() });
  }
  if (req.method === "POST" && rota.startsWith("/api/professor/duvidas/") && rota.endsWith("/rascunho-ia")) {
    if (!profDaSessao(req)) return enviar(res, 401, { ok: false, erro: "Área do professor: faça login." });
    const id = Number(rota.split("/")[4]);
    const d = db.duvidas.find((x) => x.id === id); if (!d) return enviar(res, 404, { ok: false, erro: "Dúvida não encontrada." });
    if (cacheRascunho.has(d.duvida)) { d.rascunhoIA = cacheRascunho.get(d.duvida); salvar(); return enviar(res, 200, { ok: true, cache: true, modelo: MODELO_IA, rascunho: d.rascunhoIA }); }
    if (!process.env.GEMINI_API_KEY) return enviar(res, 200, { ok: false, ia_disponivel: false, mensagem: "IA não configurada. Configure GEMINI_API_KEY para gerar o rascunho — sem chave, nenhum rascunho é inventado." });
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO_IA}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: `Você ajuda um professor de medicina a responder uma dúvida de médico, para ensino. Responda em pt-BR, de forma clara e responsável. Regras obrigatórias: cite SOMENTE diretrizes e fontes oficiais ou científicas reais que você conhece com segurança; se não tiver fonte segura, diga explicitamente que não há fonte segura e não invente referência, autor, ano ou link. Compare pelo menos duas fontes ou perspectivas (cruzamento de dados) e sinalize onde elas divergem ou onde falta dado. Não feche diagnóstico de paciente específico, não prescreva dose sem checagem, e termine com: confiança (alta/média/baixa) e o que o médico deve confirmar antes de usar. Dúvida anonimizada: ${d.duvida}` }] }] }) });
      if (r.status === 429) return enviar(res, 429, { ok: false, erro: "Cota do Gemini esgotada. O sistema parou aqui, sem tentar outro modelo." });
      const j = await r.json(); const texto = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
      if (!texto) return enviar(res, 502, { ok: false, erro: "A IA não devolveu um rascunho. Tente de novo mais tarde." });
      cacheRascunho.set(d.duvida, texto); d.rascunhoIA = texto; salvar();
      return enviar(res, 200, { ok: true, cache: false, modelo: MODELO_IA, rascunho: texto });
    } catch { return enviar(res, 502, { ok: false, erro: "Falha ao chamar a IA. Nenhum rascunho foi salvo." }); }
  }
  if (req.method === "POST" && rota.startsWith("/api/professor/duvidas/") && rota.endsWith("/responder")) {
    if (!profDaSessao(req)) return enviar(res, 401, { ok: false, erro: "Área do professor: faça login." });
    const id = Number(rota.split("/")[4]);
    const d = db.duvidas.find((x) => x.id === id); if (!d) return enviar(res, 404, { ok: false, erro: "Dúvida não encontrada." });
    const b = await lerCorpo(req);
    const fontes = String(b.fontes || "").split("\n").map((s) => s.trim()).filter(Boolean);
    if (!limpo(b.resposta, 5000) || fontes.length < 1 || !limpo(b.cruzamento, 2000) || !limpo(b.confianca, 20)) return enviar(res, 400, { ok: false, erro: "Para publicar, preencha resposta, pelo menos uma fonte científica, cruzamento de dados e confiança. Sem isso, a dúvida não é publicada." });
    d.resposta = limpo(b.resposta, 5000); d.fontes = fontes; d.cruzamento = limpo(b.cruzamento, 2000); d.confianca = limpo(b.confianca, 20); d.publicada = true; d.respondidoEm = new Date().toISOString();
    const envioResposta = await notificarEmail(d.email, "Resposta à sua dúvida — Inteligência Médica", `Olá ${d.nome},\n\nSua dúvida:\n${d.duvida}\n\nResposta do professor:\n${d.resposta}\n\nEmbasamento científico:\n${fontes.map((f) => `- ${f}`).join("\n")}\n\nCruzamento de dados:\n${d.cruzamento}\n\nConfiança: ${d.confianca}\n\nA resposta também está publicada em Tire suas dúvidas. A IA apoia, o médico decide.`);
    d.respostaEnviadaParaUsuario = envioResposta.enviado;
    if (!db.bancoPerguntas.find((q) => q.pergunta === d.duvida)) db.bancoPerguntas.push({ id: db.contador++, assunto: (ASSUNTOS.find((a) => a.nome.toLowerCase().includes((d.especialidade || "").toLowerCase().slice(0, 8)))?.id) || "fundamentos", nivel: "Todos", pergunta: d.duvida, resposta: d.resposta, fontes, cruzamento: d.cruzamento, confianca: d.confianca, tags: ["duvida-publicada"], aulaRelacionada: null, origem: "duvida-publicada", em: new Date().toISOString() });
    salvar();
    return enviar(res, 200, { ok: true, duvida: d, respostaEnviadaParaUsuario: envioResposta.enviado, avisoEmail: envioResposta.enviado ? "" : "Resposta publicada na página, mas o envio por e-mail não foi concluído (" + envioResposta.motivo + "). Use o botão de responder por e-mail na área do professor." });
  }
  if (req.method === "GET" && rota === "/api/perguntas") return enviar(res, 200, { ok: true, perguntas: [...db.perguntas].reverse() });
  if (req.method === "POST" && rota === "/api/perguntas") {
    const b = await lerCorpo(req);
    if (!limpo(b.pergunta, 1000)) return enviar(res, 400, { ok: false, erro: "Escreva a sua pergunta." });
    const p = { id: db.contador++, nome: limpo(b.nome, 80) || "Médico aluno", pergunta: limpo(b.pergunta, 1000), resposta: "", em: new Date().toISOString() };
    db.perguntas.push(p); salvar(); return enviar(res, 201, { ok: true, pergunta: p });
  }
  if (req.method === "POST" && rota.startsWith("/api/perguntas/") && rota.endsWith("/resposta")) {
    const id = Number(rota.split("/")[3]);
    const b = await lerCorpo(req);
    const p = db.perguntas.find((x) => x.id === id);
    if (!p) return enviar(res, 404, { ok: false, erro: "Pergunta não encontrada." });
    if (!limpo(b.resposta, 2000)) return enviar(res, 400, { ok: false, erro: "Escreva a resposta." });
    p.resposta = limpo(b.resposta, 2000); p.respondidoEm = new Date().toISOString(); salvar();
    return enviar(res, 200, { ok: true, pergunta: p });
  }
  if (req.method === "POST" && rota === "/api/chat") {
    const b = await lerCorpo(req);
    if (!salaTokens.has(b.token)) return enviar(res, 401, { ok: false, erro: "Entre na sala com uma conta aprovada pelo professor antes de escrever no bate-papo." });
    const texto = limpo(b.texto, 500); if (!texto) return enviar(res, 400, { ok: false, erro: "Escreva a mensagem." });
    const m = { id: db.contador++, nome: limpo(b.nome, 80) || "Aluno", texto, em: new Date().toISOString() };
    db.mensagens.push(m); if (db.mensagens.length > 200) db.mensagens = db.mensagens.slice(-200); salvar();
    wsParaSala(SALA, { type: "chat", mensagem: m });
    return enviar(res, 201, { ok: true, mensagem: m });
  }
  let file = path.join(PUBLIC_DIR, rota === "/" ? "index.html" : rota);
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("Não encontrado"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "text/plain" });
  fs.createReadStream(file).pipe(res);
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname !== "/ws") { socket.destroy(); return; }
  const key = req.headers["sec-websocket-key"];
  if (!key) { socket.destroy(); return; }
  const accept = crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n");
  const estado = { buf: Buffer.alloc(0), peerId: null, sala: null, nome: "" };
  socket.on("data", (c) => wsProcessar(socket, estado, c));
  const sair = () => { if (estado.peerId && peers.has(estado.peerId)) { peers.delete(estado.peerId); wsParaSala(SALA, { type: "peer-left", peerId: estado.peerId, nome: estado.nome }); } };
  socket.on("close", sair); socket.on("error", sair);
});

server.listen(PORT, () => console.log(`Inteligência Médica v3 em http://localhost:${PORT}`));
