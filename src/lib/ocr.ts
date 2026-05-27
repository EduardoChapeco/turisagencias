/**
 * src/lib/ocr.ts
 * 
 * Utilitário compartilhado de OCR com Gemini Vision.
 * Adaptado do aiturisagente para o ecossistema turisagencias (Supabase).
 * 
 * Usa a chave VITE_GEMINI_API_KEY do .env. Se não encontrar, lança erro
 * amigável pedindo para o usuário configurar nas Integrações.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_OCR_MODEL = 'gemini-1.5-flash-latest';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OcrOptions {
 /** Arquivos para processar (imagens ou PDFs) */
 files: File[];
 /** Prompt principal para extração */
 prompt: string;
 /** Contexto/system opcional para direcionar a IA */
 systemPrompt?: string;
}

export interface OcrResult<T = Record<string, unknown>> {
 success: boolean;
 data?: T;
 error?: string;
 rawText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Converte File em base64 inline-data para a Gemini API */
async function fileToInlineData(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onloadend = () => {
 const base64 = (reader.result as string).split(',')[1];
 resolve({ inlineData: { data: base64, mimeType: file.type } });
 };
 reader.onerror = reject;
 reader.readAsDataURL(file);
 });
}

/** Extrai JSON de uma string que pode ou não estar envolto em markdown */
function extractJson(text: string): string {
 // Tenta remover blocos ```json...```
 const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
 if (match) return match[1].trim();
 return text.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Processa um ou mais arquivos via Gemini Vision e retorna dados estruturados (JSON).
 * 
 * @example
 * const result = await processOcr<{ name: string; cpf: string }>({
 * files: [file],
 * prompt: 'Extraia nome e CPF deste documento. Retorne JSON.',
 * });
 * if (result.success) console.log(result.data?.name);
 */
export async function processOcr<T = Record<string, unknown>>(
 options: OcrOptions
): Promise<OcrResult<T>> {
 if (!GEMINI_API_KEY) {
 return {
 success: false,
 error: 'Chave da API Gemini não configurada. Acesse Configurações → Integrações para adicionar.',
 };
 }

 if (!options.files.length) {
 return { success: false, error: 'Nenhum arquivo fornecido.' };
 }

 try {
 // Converter todos os arquivos para inline-data
 const imageParts = await Promise.all(options.files.map(fileToInlineData));

 const systemContext = options.systemPrompt
 ? `CONTEXTO DO SISTEMA:\n${options.systemPrompt}\n\n`
 : '';

 const fullPrompt = `${systemContext}${options.prompt}\n\nRetorne APENAS um JSON válido, sem blocos de markdown, sem texto adicional.`;

 // Chamar a Gemini REST API diretamente (sem SDK, evita dependência)
 const response = await fetch(
 `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_OCR_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
 {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 contents: [
 {
 role: 'user',
 parts: [
 { text: fullPrompt },
 ...imageParts,
 ],
 },
 ],
 generationConfig: {
 temperature: 0.1,
 responseMimeType: 'application/json',
 },
 }),
 }
 );

 if (!response.ok) {
 const err = await response.json().catch(() => ({}));
 throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`);
 }

 const geminiResponse = await response.json() as {
 candidates?: { content?: { parts?: { text?: string }[] } }[];
 };

 const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

 if (!rawText) {
 throw new Error('Resposta vazia da IA. Tente com uma imagem de melhor qualidade.');
 }

 const jsonStr = extractJson(rawText);
 const data = JSON.parse(jsonStr) as T;

 return { success: true, data, rawText };
 } catch (error) {
 const msg = error instanceof Error ? error.message : 'Erro desconhecido no OCR.';
 console.error('[OCR] Erro:', error);
 return { success: false, error: msg };
 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompts pré-definidos (reaproveitados em vários módulos)
// ─────────────────────────────────────────────────────────────────────────────

/** Prompt de OCR para documentos de identidade (RG, CNH, Passaporte) */
export const IDENTITY_DOCUMENT_PROMPT = `
Você é um especialista em OCR para agências de turismo brasileiras.
Extraia as informações deste documento de identificação (RG, CNH ou Passaporte).
Retorne APENAS o JSON com os campos encontrados (deixe vazio "" se não encontrar):
{
 "name": "",
 "cpf": "",
 "rg": "",
 "birthDate": "",
 "address": "",
 "cep": "",
 "phone": "",
 "email": "",
 "passport_number": "",
 "passport_expiry": ""
}
`;

/** Prompt de OCR para cotações/roteiros de operadoras */
export const QUOTATION_PROMPT = `
Extraia dados desta cotação ou roteiro de viagem.
Retorne APENAS o JSON:
{
 "nome": "",
 "destino": "",
 "dataInicio": "",
 "dataFim": "",
 "nroDias": 0,
 "passageiros": "",
 "voos": [
 { "cia": "", "voo": "", "origem": "", "destino": "", "dataPartida": "", "horaPartida": "", "dataChegada": "", "horaChegada": "", "classe": "", "bagagem": "" }
 ],
 "hospedagem": [
 { "hotel": "", "cidade": "", "checkin": "", "checkout": "", "quarto": "", "regime": "" }
 ],
 "servicos": [
 { "nome": "", "data": "", "descricao": "" }
 ],
 "valores": { "subtotal": 0, "taxas": 0, "desconto": 0, "total": 0 },
 "condicoes": ""
}
`;

/** Prompt de OCR para contratos/recibos de viagem */
export const CONTRACT_PROMPT = `
Analise este Contrato de Viagem e/ou Recibo.
Retorne APENAS o JSON:
{
 "contratante": { "nome": "", "cpf": "", "rg": "", "email": "", "telefone": "", "endereco": "" },
 "pagantes": [
 { "nome": "", "cpf": "", "valor": 0, "formaPagamento": "", "parcelas": 1 }
 ],
 "pacote": { "nome": "", "destino": "", "dataInicio": "", "dataFim": "" },
 "voos": [
 { "companhia": "", "origem": "", "destino": "", "dataPartida": "", "dataChegada": "", "localizador": "" }
 ],
 "hospedagem": [
 { "nome": "", "checkin": "", "checkout": "", "localizador": "", "regime": "" }
 ],
 "passageiros": [
 { "nome": "", "cpf": "", "nascimento": "", "tipo": "" }
 ],
 "financeiro": { "valorTotal": 0 }
}
`;

/** Prompt de OCR para vouchers / boarding passes */
export const VOUCHER_PROMPT = `
Analise os vouchers de companhia aérea e/ou hospedagem.
Retorne APENAS o JSON:
{
 "destino": "",
 "localizador": "",
 "passageiros": "",
 "dataCheckin": "",
 "dataCheckout": "",
 "hotel": "",
 "voos": "",
 "transfer": "",
 "emergencia": ""
}
`;

/**
 * Prompt de OCR para propostas de bloqueio de assentos de cias aéreas.
 * Extrai dados de propostas da GOL, LATAM ou AZUL para criar bloqueios de grupo.
 */
export const SEAT_BLOCK_PROMPT = `
Você é especialista em leitura de propostas comerciais de bloqueio de assentos de companhias aéreas brasileiras (GOL, LATAM, AZUL).

Analise este documento (PDF ou imagem) e extraia TODOS os dados relevantes.
Retorne APENAS o JSON válido (sem markdown, sem texto extra):

{
 "companhia": "GOL" | "LATAM" | "AZUL" | "OUTROS",
 "codigo_voo": "",
 "origem": "",
 "destino": "",
 "data_ida": "YYYY-MM-DD",
 "data_volta": "YYYY-MM-DD",
 "classe": "Y",
 "total_assentos": 0,
 "custo_passagem_unit": 0.00,
 "prazo_nominacao": "YYYY-MM-DD",
 "prazo_pagamento": "YYYY-MM-DD",
 "localizador_bloco": "",
 "condicoes_bloco": "",
 "taxa_embarque": 0.00,
 "bagagem": "",
 "observacoes": ""
}

REGRAS:
- Se a data estiver em formato brasileiro (DD/MM/AAAA), converta para ISO (YYYY-MM-DD)
- Se não encontrar um campo, use null (não 0 e não "")
- custo_passagem_unit é o custo POR assento individual (custo da agência, não o preço final)
- total_assentos é a quantidade de assentos bloqueados no documento
- Extraia o código IATA de 3 letras para origem e destino (ex: XAP, GRU, REC)
`;
