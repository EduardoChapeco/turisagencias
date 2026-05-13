import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCreateVoucher, useUpdateVoucher } from '@/hooks/useVouchers';
import { toast } from 'sonner';
import {
    FileUp, Loader2, AlertCircle, Plane, MapPin, Building,
    Car, MessageCircle, Download, Copy, CheckCircle, Sparkles,
    User, Info, Plus, Trash2, Image as ImageIcon, ChevronLeft,
    ChevronRight, ExternalLink, FileText, Map, AlertTriangle,
    Phone, Clock, ShieldCheck, Luggage, Shield, Siren, Ticket,
    PhoneCall, HeartPulse, HelpCircle, Users
} from 'lucide-react';

const apiKey = "";

// Logo Oficial Hardcoded com link direto para a imagem transparente
const AGENCY_LOGO = "https://i.ibb.co/N2PDyTFv/Chat-GPT-Image-24-de-abr-de-2026-14-09-06.png";

const INITIAL_DATA = {
    destino: "",
    passageiros: [""],
    voos: [],
    hospedagem: [],
    transporte: [],
    passeios: [],
    seguro: [],
    contatosEmergencia: [],
    localizadorGeral: "",
    observacoes: ""
};

export default function VoucherMasterPipeline({ onClose, initialData }: { onClose?: () => void, initialData?: any }) {
    const createVoucher = useCreateVoucher();
    const updateVoucher = useUpdateVoucher();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(INITIAL_DATA);
    const [hasData, setHasData] = useState(false);
    const [validationWarnings, setValidationWarnings] = useState([]);

    // Imagens Customizáveis
    const [bgImage, setBgImage] = useState(null);
    const [generatingBg, setGeneratingBg] = useState(false);

    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('voucher'); // 'voucher' | 'embarque' | 'emergencia' | 'whatsapp'
    const [copied, setCopied] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("");

    const voucherPagesRef = useRef(null);
    const embarquePagesRef = useRef(null);
    const emergenciaPagesRef = useRef(null);

    // Injetar Fontes do Design System e Bibliotecas de Exportação
    useEffect(() => {
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const script1 = document.createElement('script');
        script1.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script1.async = true;
        document.body.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script2.async = true;
        document.body.appendChild(script2);

        return () => {
            document.head.removeChild(link);
            if (document.body.contains(script1)) document.body.removeChild(script1);
            if (document.body.contains(script2)) document.body.removeChild(script2);
        };
    }, []);

    useEffect(() => {
        if (initialData && initialData.ocr_raw_text) {
            try {
                const parsed = JSON.parse(initialData.ocr_raw_text);
                if (parsed && parsed.destino) {
                    setData(parsed);
                    setHasData(true);
                }
            } catch (e) {
                console.error("Erro ao fazer parse do initialData", e);
            }
        }
    }, [initialData]);

    const handleFileUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) processMultipleFiles(selectedFiles);
    };

    const handleImageUpload = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setter(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const processMultipleFiles = async (files) => {
        setError(null);
        setValidationWarnings([]);
        setLoading(true);
        setLoadingMessage(`Analisando ${files.length} documento(s) via IA Oficial...`);

        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            
            const systemPrompt = `
      Você é a inteligência artificial central da Excelência Tour. Seu papel é atuar como Motor OCR e Analista de Dados de pacotes de viagem.
      Analise o documento do passageiro (FRT, Orinter, CVC) e extraia um JSON canônico perfeito.

      REGRAS PÉTREAS (INTRANSÍVEIS):
      1. NÃO INVENTE DADOS. Extraia com precisão cirúrgica o que está escrito no documento.
      2. NUNCA omita IDs, Localizadores, Reservas ou Códigos de Confirmação.
      3. CENSURA B2B: É EXPRESSAMENTE PROIBIDO extrair telefones de Operadoras B2B (FRT, Orinter, CVC) ou Companhias Aéreas (Azul, Latam, Gol) para o array contatosEmergencia.
      4. CONTATOS DE EMERGÊNCIA OBRIGATÓRIOS: Você DEVE obrigatóriamente extrair os telefones do HOTEL/HOSPEDAGEM e do RECEPTIVO LOCAL (Transporte/Passeios) e listá-los no array 'contatosEmergencia'.
      5. SANITIZAÇÃO COMERCIAL: Ignore e censure textos sobre multas, cancelamento, caução, "valorize seu agente", ADMs ou resort fee.
      6. SEGREGAÇÃO CLARA: Hospedagem é diferente de Transporte (Transfer), que é diferente de Passeios (Tours). Alinhe corretamente as tabelas quebradas.
      7. SEGURO: Procure apólices de Seguro Viagem (GTA, Assist Card, Coris, Universal Assistance) e extraia os dados 24h.
      
      Retorne APENAS um JSON válido e estruturado conforme as seções: destino (string), passageiros (array of strings), voos, hospedagem, transporte, passeios, seguro, contatosEmergencia, localizadorGeral, observacoes.
    `;
            formData.append('prompt', systemPrompt);

            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ocr-extractor`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${session?.access_token}` },
                body: formData
            });

            if (!response.ok) throw new Error("Erro na comunicação com a IA");
            const result = await response.json();
            
            // Adaptar resultado do OCR-Extractor para o formato do VoucherMasterPipeline
            let extractedJson = result;
            
            const extracted = {
                destino: extractedJson.destino || "",
                passageiros: Array.isArray(extractedJson.passageiros) ? extractedJson.passageiros : [],
                voos: Array.isArray(extractedJson.voos) ? extractedJson.voos : [],
                hospedagem: Array.isArray(extractedJson.hospedagem) ? extractedJson.hospedagem : [],
                transporte: Array.isArray(extractedJson.transporte) ? extractedJson.transporte : [],
                passeios: Array.isArray(extractedJson.passeios) ? extractedJson.passeios : [],
                seguro: Array.isArray(extractedJson.seguro) ? extractedJson.seguro : [],
                contatosEmergencia: Array.isArray(extractedJson.contatosEmergencia) ? extractedJson.contatosEmergencia : [],
                localizadorGeral: extractedJson.localizadorGeral || "",
                observacoes: sanitizeObservations(extractedJson.observacoes)
            };

            const accumulatedData = mergeData(hasData ? data : INITIAL_DATA, extracted);
            setData(accumulatedData);
            setHasData(true);
            runValidationChecks(accumulatedData);

            if (accumulatedData.destino && !bgImage) {
                const periodoContexto = accumulatedData.voos.length > 0 ? accumulatedData.voos[0].data : "";
                generateDestinationBg(accumulatedData.destino, periodoContexto);
            }
            toast.success("Dados extraídos com sucesso!");
        } catch (err) {
            console.error("Erro:", err);
            setError("Falha ao processar os arquivos. Verifique se os PDFs estão corrompidos.");
            toast.error("Falha ao processar OCR.");
        } finally {
            setLoading(false);
            setLoadingMessage("");
            const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };

    const runValidationChecks = (currentData) => {
        const warnings = [];
        if (!currentData.destino) warnings.push("Destino principal não foi identificado na IA.");
        if (!currentData.passageiros || currentData.passageiros.length === 0 || currentData.passageiros[0] === "") warnings.push("Passageiros não identificados. Preencha manualmente.");
        if (currentData.voos.length === 0 && currentData.hospedagem.length === 0) warnings.push("Aviso: Nenhum Voo ou Hospedagem detectado.");
        setValidationWarnings(warnings);
    };

    const mergeData = (current, extracted) => {
        const rawPassageiros = [...current.passageiros, ...(extracted.passageiros || [])];
        const uniquePassageiros = [...new Set(rawPassageiros.map(p => p.trim()))].filter(p => p && p.toLowerCase() !== "adulto" && p.toLowerCase() !== "criança");

        const mergedHospedagem = [...current.hospedagem];
        (extracted.hospedagem || []).forEach(h => {
            if (!mergedHospedagem.some(existente => existente.nome === h.nome && existente.checkin === h.checkin)) {
                mergedHospedagem.push(h);
            }
        });

        return {
            destino: current.destino || extracted.destino || "",
            passageiros: uniquePassageiros.length > 0 ? uniquePassageiros : [""],
            voos: [...current.voos, ...(extracted.voos || [])],
            hospedagem: mergedHospedagem,
            transporte: [...current.transporte, ...(extracted.transporte || [])],
            passeios: [...current.passeios, ...(extracted.passeios || [])],
            seguro: [...current.seguro, ...(extracted.seguro || [])],
            contatosEmergencia: [...current.contatosEmergencia, ...(extracted.contatosEmergencia || [])],
            localizadorGeral: current.localizadorGeral || extracted.localizadorGeral || "",
            observacoes: [current.observacoes, extracted.observacoes].filter(Boolean).join("\n\n")
        };
    };

    const clearData = () => {
        setData(INITIAL_DATA);
        setHasData(false);
        setBgImage(null);
        setError(null);
        setValidationWarnings([]);
    };

    // Gerador de Imagem Melhorado: Prompt rico e dinâmico com base na cidade/destino
    const generateDestinationBg = async (destination, periodo) => {
        if (!destination || destination.trim() === "") return;
        setGeneratingBg(true);

        const promptText = `A breathtaking, highly professional, cinematic luxury travel photography of ${destination}. Travel period: ${periodo || 'Daytime'}. Focus on iconic landmarks or beautiful scenery of this specific city. Photorealistic, 8k resolution, vertical composition. Vacation vibe, clear sky. No text, no watermarks, negative space in the center.`;

        for (let i = 0; i <= 5; i++) {
            try {
                const payload = i % 2 === 0
                    ? { instances: { prompt: promptText }, parameters: { sampleCount: 1 } }
                    : { instances: [{ prompt: promptText }], parameters: { sampleCount: 1 } };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (i < 5) {
                        await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
                        continue;
                    }
                    throw new Error("Falha ao gerar imagem após tentativas.");
                }

                const result = await response.json();
                if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                    setBgImage(`data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`);
                    break;
                } else {
                    if (i < 5) continue;
                    throw new Error("Formato de predição inválido retornado pela API.");
                }
            } catch (err) {
                if (i >= 5) console.error("Falha final ao gerar imagem de fundo:", err);
            }
        }
        setGeneratingBg(false);
    };

    const sanitizeObservations = (obs) => {
        if (!obs) return "";
        let clean = obs;
        const blocklistRegex = /caução|caucao|caution|multa|cancelamento(s)?|reembolsável|taxa(s)? loca(is|l)|resort fee|bloqueado como garantia|valorize seu agente|ADM's|emergência.*frt|soluções mais rápidas/gi;
        const sentences = clean.split(/(?<=[.?!])\s+|\n/);

        const filteredSentences = sentences.filter(sentence => {
            if (!sentence || sentence.trim() === "") return false;
            return !blocklistRegex.test(sentence);
        });

        return filteredSentences.join(" ").trim();
    };

    const handleSave = async () => {
        setLoading(true);
        setLoadingMessage("Salvando no sistema...");
        try {
            const payload = {
                destino: data.destino,
                localizador: data.localizadorGeral,
                passageiros: data.passageiros.join(', '),
                data_checkin: data.hospedagem[0]?.checkin || null,
                data_checkout: data.hospedagem[0]?.checkout || null,
                hotel: JSON.stringify(data.hospedagem),
                voos: JSON.stringify(data.voos),
                transfer: JSON.stringify(data.transporte),
                emergencia: JSON.stringify(data.contatosEmergencia),
                ocr_raw_text: JSON.stringify(data)
            };

            if (initialData?.id) {
                await updateVoucher.mutateAsync({ id: initialData.id, ...payload });
            } else {
                await createVoucher.mutateAsync(payload);
            }
            if (onClose) onClose();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar o voucher.");
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
        runValidationChecks({ ...data, [field]: value });
    };

    const updateArrayItem = (arrayName, index, field, value) => {
        setData(prev => {
            const newArray = [...prev[arrayName]];
            if (typeof newArray[index] === 'object') {
                newArray[index] = { ...newArray[index], [field]: value };
            } else {
                newArray[index] = value;
            }
            const newData = { ...prev, [arrayName]: newArray };
            runValidationChecks(newData);
            return newData;
        });
    };

    const addArrayItem = (arrayName, defaultObj) => setData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], defaultObj] }));
    const removeArrayItem = (arrayName, index) => {
        setData(prev => {
            const newData = { ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) };
            runValidationChecks(newData);
            return newData;
        });
    };

    const generateWhatsAppText = () => {
        const fornecedorTransporte = data.transporte.length > 0 ? data.transporte[0].fornecedor : "Nossa equipe parceira";
        const contatoTransporte = data.transporte.length > 0 ? data.transporte[0].telefone : "Verifique no voucher";

        let text = `Bom dia! A viagem de vocês está chegando, e aqui estão os últimos detalhes para garantir um embarque tranquilo. ✈️✨\n\n`;

        text += `📌 *Voucher:* Lembrando que não é necessário imprimir, basta apresentar no celular! Todas as informações do seu pacote estão neste documento`;

        if (data.hospedagem.length > 0 && data.hospedagem[0].localizador) text += `, desde o hotel (ID: ${data.hospedagem[0].localizador})`;
        if (data.transporte.length > 0 && data.transporte[0].localizador) text += `, informações de traslado (ID: ${data.transporte[0].localizador})`;
        text += `... tudo está no documento, incluindo horários de voos.\n\n`;

        text += `🛂 *Documentos para embarque:* Levem o RG ou CNH (originais e em bom estado) – qualquer um dos dois é suficiente para viagens no Brasil.\n\n`;

        if (data.transporte.length > 0) {
            text += `🚗 *Detalhes do transfer:* Os receptivos normalmente esperam os passageiros na saída do voo com uma plaquinha. Em situações de muito movimento, dirija-se ao guichê nas proximidades. Os funcionários estarão uniformizados.\n`;
            text += `FORNECEDOR: ${fornecedorTransporte}\n`;
            text += `CONTATO/WHATSAPP: ${contatoTransporte}\n\n`;
        }

        if (data.passeios.length > 0) {
            text += `🗺️ *Passeios Contratados:*\nLembre-se de verificar o horário e o ponto de encontro de cada passeio para não perder nada dessa experiência incrível!\n\n`;
        }

        if (data.observacoes) {
            text += `⚠️ *Observações Importantes:*\n${data.observacoes}\n\n`;
        }

        text += `A *Excelência Tour* deseja a vocês uma viagem incrível! Qualquer dúvida, estamos à disposição. 🥂`;
        return text;
    };

    const copyWhatsApp = () => {
        const textArea = document.createElement("textarea");
        textArea.value = generateWhatsAppText();
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openInNewTab = () => {
        const newWindow = window.open('', '_blank');
        if (!newWindow) {
            alert("Por favor, permita pop-ups no seu navegador para abrir em uma nova aba.");
            return;
        }

        let contentToPrint = '';
        if (activeTab === 'embarque') contentToPrint = embarquePagesRef.current.innerHTML;
        else if (activeTab === 'emergencia') contentToPrint = emergenciaPagesRef.current.innerHTML;
        else contentToPrint = voucherPagesRef.current.innerHTML;

        // Construtor seguro para evitar erro do Parser ESBuild e garantir a injeção do Tailwind e Fontes
        const scriptStart = "<scr" + "ipt src=\"https://cdn.tailwindcss.com\"></scr" + "ipt>";

        const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Documento Oficial - Excelência Tour</title>
        ${scriptStart}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { 
            background: #FDFDFD; 
            font-family: 'DM Sans', sans-serif; 
            padding: 40px; 
            display: flex; 
            flex-wrap: wrap; 
            gap: 20px; 
            justify-content: center;
            margin: 0;
          }
          .font-display { font-family: 'Cormorant Garamond', serif; }
          .font-body { font-family: 'DM Sans', sans-serif; }
          .story-page {
            width: 400px;
            min-height: 711px;
            height: max-content;
            flex-shrink: 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin-bottom: 20px;
            border: 1px solid #EAEAEA;
            box-sizing: border-box;
          }
          @media print {
            @page { size: auto; margin: 0mm; }
            body { background: white; padding: 0; display: block; margin: 0; }
            .story-page { margin-bottom: 20px; page-break-after: always; box-shadow: none; border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        ${contentToPrint}
      </body>
      </html>
    `;
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    };

    const exportPages = async (ref, prefix) => {
        if (!window.html2canvas || !ref.current) return;
        setLoading(true);
        setLoadingMessage("Gerando imagens em Qualidade 8K...");

        try {
            const pages = ref.current.querySelectorAll('.story-page');
            for (let i = 0; i < pages.length; i++) {
                const pageEl = pages[i];

                // Garante que o elemento está visível no viewport para o html2canvas não o cortar
                pageEl.scrollIntoView({ behavior: 'instant', block: 'start' });
                await new Promise(r => setTimeout(r, 150));

                const canvas = await window.html2canvas(pageEl, {
                    scale: 3, // Ultra Qualidade, mas sem sobrecarregar a memória do browser
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    logging: false
                });

                const link = document.createElement('a');
                link.download = `ExcelenciaTour-${prefix}-Pagina${i + 1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (err) {
            console.error("Erro ao gerar imagens:", err);
            alert("Ocorreu um erro ao exportar as imagens.");
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async (ref, fileName) => {
        if (!window.html2canvas || !window.jspdf || !ref.current) {
            alert("As bibliotecas de exportação ainda estão carregando. Tente novamente em 2 segundos.");
            return;
        }

        setLoading(true);
        setLoadingMessage("Gerando PDF Oficial Ultra Seguro...");

        try {
            const { jsPDF } = window.jspdf;
            const pages = ref.current.querySelectorAll('.story-page');
            let pdf = null;

            for (let i = 0; i < pages.length; i++) {
                const pageEl = pages[i];

                // Força visibilidade para evitar cortes em layouts flex/grid
                pageEl.scrollIntoView({ behavior: 'instant', block: 'start' });
                await new Promise(r => setTimeout(r, 150));

                const canvas = await window.html2canvas(pageEl, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);

                const pdfWidth = 400;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
                        unit: 'pt',
                        format: [pdfWidth, pdfHeight]
                    });
                } else {
                    pdf.addPage([pdfWidth, pdfHeight], pdfHeight > pdfWidth ? 'portrait' : 'landscape');
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            if (pdf) {
                pdf.save(`${fileName}.pdf`);
            }
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            alert("Ocorreu um erro ao exportar o PDF.");
        } finally {
            setLoading(false);
        }
    };

    const HeaderLogo = () => (
        <div className= "flex items-center gap-4 mb-8 shrink-0" >
        <img 
        src={ AGENCY_LOGO }
    alt = "Excelência Tour"
    className = "h-10 w-auto object-contain drop-shadow-sm"
    crossOrigin = "anonymous"
    onError = {(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
    }
} 
      />
{/* Fallback caso a imagem falhe o carregamento */ }
<div style={ { display: 'none' } } className = "items-center gap-3" >
    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20" >
        <Plane size={ 20 } className = "text-white" />
            </div>
            < div >
            <h1 className="text-xl font-display font-bold text-white uppercase leading-none tracking-wide" > Excelência Tour </h1>
                < p className = "text-[9px] text-[#6EC3EC] font-bold uppercase tracking-[0.2em] mt-1" > Guia Oficial de Embarque </p>
                    </div>
                    </div>
                    </div>
  );

// COMPONENTE ID BADGE - Reescrito com Flexbox seguro e Word-Wrap para suportar strings longas sem cortar
const SectionIdBadge = ({ id }) => {
    if (!id) return null;
    return (
        <div style= {{ display: 'flex', flexDirection: 'column', marginBottom: '16px', maxWidth: '100%' }
}>
    <div style={ { display: 'inline-flex', alignItems: 'center', backgroundColor: '#1A2B47', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(110, 195, 236, 0.4)', maxWidth: '100%', boxSizing: 'border-box' } }>
        <Ticket size={ 16 } color = "#6EC3EC" style = {{ flexShrink: 0, marginRight: '8px' }} />
            < span style = {{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#8BA3BB', marginRight: '6px', flexShrink: 0 }}>
                ID / Voucher:
</span>
    < span style = {{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.05em', color: '#6EC3EC', wordBreak: 'break-all', overflowWrap: 'break-word', flex: 1 }}>
        { id }
        </span>
        </div>
        </div>
    );
  };

return (
    // CONTÊINER PRINCIPAL RESTRITO: Mantém as barras de scroll independentes e o layout flat.
    <div className= "h-full w-full bg-[#FDFDFD] font-sans text-slate-800 flex flex-col overflow-hidden" >

    {/* HEADER FIXO DO APP - MINIMALISTA CLAUDE STYLE */ }
    < header className = "bg-white px-6 py-3 flex items-center justify-between shrink-0 z-20 border-b border-slate-200" >
        <div className="flex items-center gap-4" >
            {onClose && (
                <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition font-bold text-xs mr-2">
                    Fechar
                </button>
            )}
            <button onClick={ () => setSidebarOpen(!sidebarOpen) } className = "p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition" title = "Menu CMS" >
                { sidebarOpen?<ChevronLeft size = { 20 }/> : <ChevronRight size={ 20 }/>}
</button>
    < div className = "flex items-center gap-3" >
        <img src={ AGENCY_LOGO } alt = "Excelência Tour" className = "h-7 w-auto object-contain hidden sm:block" crossOrigin = "anonymous" />
            </div>
            </div>

{/* TABS CENTRALIZADAS - FLAT */ }
<div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200" >
    <button 
             onClick={ () => setActiveTab('voucher') }
className = {`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 font-semibold text-xs ${activeTab === 'voucher' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
title = "Ver Voucher"
    >
    <FileText size={ 16 } /> <span className="hidden sm:block">Voucher Visual</span >
        </button>
        < button
onClick = {() => setActiveTab('embarque')}
className = {`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 font-semibold text-xs ${activeTab === 'embarque' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
title = "Guia de Embarque"
    >
    <Info size={ 16 } /> <span className="hidden sm:block">Info. Embarque</span >
        </button>
        < button
onClick = {() => setActiveTab('emergencia')}
className = {`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 font-semibold text-xs ${activeTab === 'emergencia' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
title = "Guia de Emergência e Contatos"
    >
    <Siren size={ 16 } /> <span className="hidden sm:block">Emergência</span >
        </button>
        < div className = "w-px h-4 bg-slate-300 mx-1" > </div>
            < button
onClick = {() => setActiveTab('whatsapp')}
className = {`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 font-semibold text-xs ${activeTab === 'whatsapp' ? 'bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/20' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
title = "Mensagem WhatsApp"
    >
    <MessageCircle size={ 16 } /> <span className="hidden sm:block">WhatsApp</span >
        </button>
        </div>

{/* EXPORTAÇÃO - MINIMALISTA */ }
<div className="flex items-center gap-2" >
    { loading && (
        <span className="hidden lg:flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mr-4" >
            <Loader2 size={ 14 } className = "animate-spin" /> { loadingMessage || "Processando..."}
</span>
          )}
{
    hasData && (
        <>
        { activeTab !== 'whatsapp' && (
            <>
            <button 
                    onClick={
        () => {
            if (activeTab === 'voucher') exportPages(voucherPagesRef, 'Voucher');
            else if (activeTab === 'embarque') exportPages(embarquePagesRef, 'Embarque');
            else exportPages(emergenciaPagesRef, 'Emergencia');
        }
    }
    className = "p-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center justify-center"
    title = "Baixar Imagens (PNG Alta Qualidade)"
        >
        <ImageIcon size={ 18 }/>
            </button>
            < button
    onClick = {() => {
        const suffix = activeTab === 'voucher' ? 'Voucher' : activeTab === 'embarque' ? 'Embarque' : 'Emergencia';
        const ref = activeTab === 'voucher' ? voucherPagesRef : activeTab === 'embarque' ? embarquePagesRef : emergenciaPagesRef;
        exportPDF(ref, `ExcelenciaTour-${suffix}-${data.destino || 'Viagem'}`);
    }
}
className = "p-2 rounded-md bg-[#1A2B47] text-white hover:bg-[#2C4A6E] transition flex items-center justify-center shadow-sm"
title = "Baixar Arquivo Oficial PDF"
    >
    <Download size={ 18 }/>
        </button>
        </>
             )}
<div className="w-px h-4 bg-slate-200 mx-1" > </div>
    < button
onClick = { openInNewTab }
className = "p-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center justify-center"
title = "Visualizar em Tela Cheia / Nova Aba"
    >
    <ExternalLink size={ 18 }/>
        </button>
        </>
          )}
</div>
    </header>

{/* ÁREA PRINCIPAL */ }
<main id="main-section" className = "flex flex-1 overflow-hidden h-full" >

    {/* SIDEBAR CMS (CRUD) - FUNDO BRANCO E SCROLL PRÓPRIO */ }
    < aside className = {`bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 flex flex-col shrink-0 z-10 h-full ${sidebarOpen ? 'w-[420px]' : 'w-0 border-r-0'}`}>
        <div className="p-6 w-[420px]" >

            <div className="mb-8 p-1" >
                <label className="block w-full p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer text-center group relative z-10" >
                    <FileUp className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        <span className="block text-sm font-semibold text-slate-700" > Importar PDF do Voucher </span>
                            < span className = "text-[10px] text-slate-400 mt-1 block uppercase tracking-wide" > Pode selecionar múltiplos arquivos </span>
                                < input id = "file-upload-input" type = "file" className = "hidden" onChange = { handleFileUpload } accept = "image/*,application/pdf" multiple />
                                    </label>

{
    validationWarnings.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-xs relative z-10" >
            <p className="font-semibold flex items-center gap-1.5 mb-1" > <AlertTriangle size={ 14 } /> Revisão Sugerida</p >
                <ul className="list-disc pl-4 space-y-1 text-orange-700/80" >
                    { validationWarnings.map((w, i) => <li key={ i } > { w } </li>) }
                    </ul>
                    </div>
                )
}

{ error && <p className="mt-3 text-xs text-red-600 font-semibold flex items-center gap-1" > <AlertCircle size={ 14 } />{error}</p >}

{
    hasData && (
        <div className="mt-4 flex flex-col gap-2 relative z-10">
            <button onClick={ handleSave } className = "w-full py-3 bg-vj-green text-white rounded-lg text-sm font-bold hover:bg-vj-green/90 transition shadow-sm" >
                {initialData?.id ? 'Salvar Alterações' : 'Salvar Voucher Oficial'}
            </button>
            <button onClick={ clearData } className = "w-full py-2 bg-white border border-red-100 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition" >
                Limpar Todos os Dados
            </button>
        </div>
    )
}
</div>

    < div className = {`mb-8 space-y-4 ${!hasData ? 'opacity-40 pointer-events-none' : ''}`}>
        <SectionTitle icon={
            <ImageIcon size={ 14 } />} title="Identidade da Viagem" / >
                <div className="grid grid-cols-1 gap-3" >
                    <label className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition" >
                        <span className="text-xs font-semibold text-slate-600" > Alterar Foto de Fundo(Capa) </span>
                            < span className = "text-[10px] text-slate-400" > Tamanho ideal: 9: 16(Vertical) </span>
                                < input type = "file" className = "hidden" onChange = {(e) => handleImageUpload(e, setBgImage)
} accept = "image/*" />
    </label>
    </div>
    </div>

    < div className = {`space-y-8 pb-12 ${!hasData ? 'opacity-40 pointer-events-none' : ''}`}>

        {/* Resumo */ }
        < div className = "space-y-4" >
            <SectionTitle icon={
                <MapPin size={ 14 } />} title="Resumo e Destino" / >
                    <InputField label="Destino da Viagem" value = { data.destino } onChange = {(v) => updateField('destino', v)
} />
    < InputField label = "ID / Localizador Geral" value = { data.localizadorGeral } onChange = {(v) => updateField('localizadorGeral', v)} />
        </div>

{/* Passageiros */ }
<div className="space-y-3" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Users size={ 14 } />} title="Passageiros" / >
                <button onClick={ () => addArrayItem('passageiros', '') } className = "text-slate-400 hover:text-slate-800 p-1 rounded" > <Plus size={ 16 } /></button >
                    </div>
    {
        data.passageiros.map((p, idx) => (
            <div key= { idx } className = "flex gap-2" >
            <InputField noLabel value = { p } onChange = {(v) => updateArrayItem('passageiros', idx, null, v)} placeholder = {`Passageiro ${idx + 1}`
} />
    < button onClick = {() => removeArrayItem('passageiros', idx)} className = "text-slate-300 hover:text-red-500 p-2" > <Trash2 size={ 16 } /></button >
        </div>
                 ))}
</div>

{/* Voos */ }
<div className="space-y-4" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Plane size={ 14 } />} title="Voos" / >
                <button onClick={ () => addArrayItem('voos', { tipo: 'Ida', data: '', trecho: '', cia: '', voo: '', horario: '', localizador: '' }) } className = "text-slate-400 hover:text-slate-800 p-1 rounded flex items-center text-xs font-semibold gap-1" > <Plus size={ 14 } /> Adicionar</button >
                    </div>
    {
        data.voos.map((voo, idx) => (
            <div key= { idx } className = "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group" >
            <button onClick={() => removeArrayItem('voos', idx)} className = "absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" > <Trash2 size={ 14 } /></button >
                <div className="grid grid-cols-2 gap-3" >
                    <InputField label="Tipo (Ida/Volta)" value = { voo.tipo } onChange = {(v) => updateArrayItem('voos', idx, 'tipo', v)
} />
    < InputField label = "ID/Localizador" value = { voo.localizador } onChange = {(v) => updateArrayItem('voos', idx, 'localizador', v)} />
        </div>
        < div className = "grid grid-cols-2 gap-3" >
            <InputField label="Data" value = { voo.data } onChange = {(v) => updateArrayItem('voos', idx, 'data', v)} />
                < InputField label = "Trecho" value = { voo.trecho } onChange = {(v) => updateArrayItem('voos', idx, 'trecho', v)} />
                    < InputField label = "Cia/Voo" value = {`${voo.cia} ${voo.voo}`} onChange = {(v) => {
    const [cia, ...rest] = v.split(' ');
    updateArrayItem('voos', idx, 'cia', cia || '');
    updateArrayItem('voos', idx, 'voo', rest.join(' ') || '');
}} />
    < InputField label = "Horário" value = { voo.horario } onChange = {(v) => updateArrayItem('voos', idx, 'horario', v)} />
        </div>
        </div>
                 ))}
</div>

{/* Hospedagem */ }
<div className="space-y-4" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Building size={ 14 } />} title="Hospedagem" / >
                <button onClick={ () => addArrayItem('hospedagem', { nome: '', checkin: '', checkout: '', regime: '', localizador: '' }) } className = "text-slate-400 hover:text-slate-800 p-1 rounded flex items-center text-xs font-semibold gap-1" > <Plus size={ 14 } /> Adicionar</button >
                    </div>
    {
        data.hospedagem.map((hotel, idx) => (
            <div key= { idx } className = "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group" >
            <button onClick={() => removeArrayItem('hospedagem', idx)} className = "absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" > <Trash2 size={ 14 } /></button >
                <InputField label="ID/Confirmação Hotel" value = { hotel.localizador } onChange = {(v) => updateArrayItem('hospedagem', idx, 'localizador', v)
} />
    < InputField label = "Nome do Hotel" value = { hotel.nome } onChange = {(v) => updateArrayItem('hospedagem', idx, 'nome', v)} />
        < div className = "grid grid-cols-2 gap-3" >
            <InputField label="Check-in" value = { hotel.checkin } onChange = {(v) => updateArrayItem('hospedagem', idx, 'checkin', v)} />
                < InputField label = "Check-out" value = { hotel.checkout } onChange = {(v) => updateArrayItem('hospedagem', idx, 'checkout', v)} />
                    </div>
                    < InputField label = "Regime (Ex: Café da manhã)" value = { hotel.regime } onChange = {(v) => updateArrayItem('hospedagem', idx, 'regime', v)} />
                        </div>
                 ))}
</div>

{/* Transporte */ }
<div className="space-y-4" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Car size={ 14 } />} title="Transporte / Transfer" />
                < button onClick = {() => addArrayItem('transporte', { detalhes: '', fornecedor: '', pontoEncontro: '', telefone: '', localizador: '' })
} className = "text-slate-400 hover:text-slate-800 p-1 rounded flex items-center text-xs font-semibold gap-1" > <Plus size={ 14 } /> Adicionar</button >
    </div>
{
    data.transporte.map((t, idx) => (
        <div key= { idx } className = "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group" >
        <button onClick={() => removeArrayItem('transporte', idx)} className = "absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" > <Trash2 size={ 14 } /></button >
            <InputField label="ID/Voucher Transporte" value = { t.localizador } onChange = {(v) => updateArrayItem('transporte', idx, 'localizador', v)} />
                < InputField label = "Serviço" value = { t.detalhes } onChange = {(v) => updateArrayItem('transporte', idx, 'detalhes', v)} />
                    < InputField label = "Fornecedor" value = { t.fornecedor } onChange = {(v) => updateArrayItem('transporte', idx, 'fornecedor', v)} />
                        < InputField label = "Ponto de Encontro" value = { t.pontoEncontro } onChange = {(v) => updateArrayItem('transporte', idx, 'pontoEncontro', v)} />
                            < InputField label = "Telefone de Contato" value = { t.telefone } onChange = {(v) => updateArrayItem('transporte', idx, 'telefone', v)} />
                                </div>
                 ))}
</div>

{/* Passeios */ }
<div className="space-y-4" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Map size={ 14 } />} title="Passeios" / >
                <button onClick={ () => addArrayItem('passeios', { nome: '', data: '', fornecedor: '', pontoEncontro: '', telefone: '', localizador: '' }) } className = "text-slate-400 hover:text-slate-800 p-1 rounded flex items-center text-xs font-semibold gap-1" > <Plus size={ 14 } /> Adicionar</button >
                    </div>
    {
        data.passeios.map((p, idx) => (
            <div key= { idx } className = "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group" >
            <button onClick={() => removeArrayItem('passeios', idx)} className = "absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" > <Trash2 size={ 14 } /></button >
                <InputField label="ID/Voucher Passeio" value = { p.localizador } onChange = {(v) => updateArrayItem('passeios', idx, 'localizador', v)
} />
    < InputField label = "Nome do Passeio" value = { p.nome } onChange = {(v) => updateArrayItem('passeios', idx, 'nome', v)} />
        < InputField label = "Data do Passeio" value = { p.data } onChange = {(v) => updateArrayItem('passeios', idx, 'data', v)} />
            < InputField label = "Fornecedor" value = { p.fornecedor } onChange = {(v) => updateArrayItem('passeios', idx, 'fornecedor', v)} />
                < InputField label = "Ponto de Encontro" value = { p.pontoEncontro } onChange = {(v) => updateArrayItem('passeios', idx, 'pontoEncontro', v)} />
                    < InputField label = "Telefone/WhatsApp" value = { p.telefone } onChange = {(v) => updateArrayItem('passeios', idx, 'telefone', v)} />
                        </div>
                 ))}
</div>

{/* Seguro Viagem */ }
<div className="space-y-4" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Shield size={ 14 } />} title="Seguro Viagem" / >
                <button onClick={ () => addArrayItem('seguro', { seguradora: '', apolice: '', cobertura: '', telefone: '' }) } className = "text-slate-400 hover:text-slate-800 p-1 rounded flex items-center text-xs font-semibold gap-1" > <Plus size={ 14 } /> Adicionar</button >
                    </div>
    {
        data.seguro.map((s, idx) => (
            <div key= { idx } className = "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group" >
            <button onClick={() => removeArrayItem('seguro', idx)} className = "absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" > <Trash2 size={ 14 } /></button >
                <InputField label="Seguradora" value = { s.seguradora } onChange = {(v) => updateArrayItem('seguro', idx, 'seguradora', v)
} />
    < InputField label = "Número da Apólice" value = { s.apolice } onChange = {(v) => updateArrayItem('seguro', idx, 'apolice', v)} />
        < InputField label = "Plano / Cobertura" value = { s.cobertura } onChange = {(v) => updateArrayItem('seguro', idx, 'cobertura', v)} />
            < InputField label = "Telefone de Emergência" value = { s.telefone } onChange = {(v) => updateArrayItem('seguro', idx, 'telefone', v)} />
                </div>
                 ))}
</div>

{/* Contatos de Emergência */ }
<div className="space-y-4" >
    <div className="flex items-center justify-between" >
        <SectionTitle icon={
            <Phone size={ 14 } />} title="Contatos Locais do Passageiro" / >
                <button onClick={ () => addArrayItem('contatosEmergencia', { nome: '', categoria: '', telefone: '' }) } className = "text-slate-400 hover:text-slate-800 p-1 rounded flex items-center text-xs font-semibold gap-1" > <Plus size={ 14 } /> Adicionar</button >
                    </div>
                    < p className = "text-xs text-slate-500 mb-2" > Estes contatos formarão o seu < strong > Terceiro Documento(Guia de Emergência) < /strong>.</p >
                    {
                        data.contatosEmergencia.map((c, idx) => (
                            <div key= { idx } className = "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group" >
                            <button onClick={() => removeArrayItem('contatosEmergencia', idx)} className = "absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" > <Trash2 size={ 14 } /></button >
                                <div className="grid grid-cols-2 gap-3" >
                                    <InputField label="Empresa/Órgão" value = { c.nome } onChange = {(v) => updateArrayItem('contatosEmergencia', idx, 'nome', v)
} placeholder = "Ex: Fornecedor Receptivo" />
    <InputField label="Categoria" value = { c.categoria } onChange = {(v) => updateArrayItem('contatosEmergencia', idx, 'categoria', v)} placeholder = "Ex: Guia Local, Seguro" />
        </div>
        < InputField label = "Telefone / WhatsApp 24h" value = { c.telefone } onChange = {(v) => updateArrayItem('contatosEmergencia', idx, 'telefone', v)} />
            </div>
                 ))}
</div>

{/* Observações */ }
<div className="space-y-4" >
    <SectionTitle icon={
        <Info size={ 14 } />} title="Observações Gerais" / >
            <textarea 
                    value={ data.observacoes }
    onChange = {(e) => updateField('observacoes', e.target.value)
}
rows = { 4}
className = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
placeholder = "Regras, dicas ou avisos úteis..."
    />
    </div>

    </div>
    </div>
    </aside>

{/* ÁREA DE VISUALIZAÇÃO CENTRAL - BACKGROUND CLEAN COM SCROLL PRÓPRIO */ }
<section className="flex-1 bg-[#FAFAFA] relative flex flex-col overflow-hidden border-l border-slate-200 h-full" >
    <div id="scroll-container" className = "flex-1 overflow-y-auto p-6 md:p-10 flex justify-center items-start h-full" >

        {!hasData ? (
            <div className= "text-center text-slate-400 mt-20 max-w-sm" >
            <Sparkles size={ 48 } className = "mx-auto mb-4 opacity-30 text-slate-400" />
                <p className="font-medium text-slate-500 text-sm" > Importe o PDF do voucher para gerar os templates oficiais.Use o menu superior para alternar entre Voucher, Guia de Embarque e Guia de Emergência.</p>
                    </div>
             ) : (
    <>
    {/* =========================================
                      ABA 1: VOUCHER (PÁGINAS DO SERVIÇO)
                 =========================================== */}
                 {
    activeTab === 'voucher' && (
        <div 
                      ref={ voucherPagesRef }
    className = "flex flex-wrap justify-center gap-10 pb-20 w-full items-start"
        >
        {/* PÁGINA 1: CAPA GERAL (PREMIUM DESIGN) */ }
        < div className = "story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#1A2B47' }
}>
    { bgImage && (
        <img src={ bgImage } alt = "Fundo Destino" crossOrigin = "anonymous" style = {{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, zIndex: 0 }} />
                        )}
{/* Overlay Gradiente Premium */ }
<div style={ { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(26,43,71,0.2) 0%, rgba(26,43,71,0.95) 100%)' } }> </div>

    < div className = "relative z-10 flex flex-col min-h-[647px] h-full" >
        <HeaderLogo />
        < div className = "flex-1 flex flex-col justify-end pb-10" >
            <SectionIdBadge id={ data.localizadorGeral } />
                < p className = "text-[#6EC3EC] text-[12px] font-bold uppercase tracking-[0.3em] mb-2 drop-shadow-md" > Seu Destino </p>
                    < h2 className = "text-[56px] font-display font-bold text-white leading-[0.9] tracking-tight mb-8 break-words drop-shadow-lg" >
                        { data.destino || "Destino" }
                        </h2>

                        < div className = "p-6 rounded-3xl border border-white/10 shadow-2xl" style = {{ backgroundColor: 'rgba(15, 28, 46, 0.6)' }}>
                            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2" >
                                <Users size={ 14 } className = "text-[#6EC3EC]" /> Viajantes
                                    </p>
                                    < div className = "space-y-3" >
                                    {
                                        data.passageiros.map((p, i) => (
                                            <div key= { i } className = "flex items-center gap-3" >
                                            <div className="w-2 h-2 rounded-full bg-[#6EC3EC] shrink-0" > </div>
                                        < span className = "text-white font-medium text-sm leading-snug break-words" > { p } </span>
                                        </div>
                                        ))
                                    }
                                        </div>
                                        </div>
                                        </div>
                                        < div className = "text-center mt-auto pt-6 border-t border-white/10" >
                                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold" > Documento Oficial de Viagem • Excelência Tour </p>
                                                </div>
                                                </div>
                                                </div>

{/* PÁGINA 2: VOOS */ }
{
    data.voos.length > 0 && (
        <div className="story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#F5F0EB' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-6 pb-6 border-b border-[#1A2B47]/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#6EC3EC] rounded-xl flex items-center justify-center shrink-0" >
                <Plane size={ 24 } className = "text-[#1A2B47]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-[#1A2B47] leading-none" > Voos </h2>
                        < p className = "text-[10px] text-[#2C4A6E] uppercase tracking-widest font-bold mt-1" > Roteiro Aéreo </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >
                            {
                                data.voos.map((voo, i) => (
                                    <div key= { i } className = "bg-white p-5 rounded-2xl border border-slate-200" >
                                    <div className="flex justify-between items-start mb-4" >
                                <div style={{ flex: 1, maxWidth: '100%' }} > <SectionIdBadge id={ voo.localizador } /></div >
                                {
                                    voo.tipo && (
                                        <div style={ { display: 'inline-block', backgroundColor: '#1A2B47', color: 'white', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start', marginLeft: '8px' } }>
                                            { voo.tipo }
                                            </div>
                                      )}
</div>
    < div className = "flex justify-between items-start mb-3" >
        <div>
        <p className="text-[10px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-1" > Data / Trecho </p>
            < p className = "font-bold text-[#1A2B47] text-sm break-words" > { voo.data } < span className = "text-[#6EC3EC] mx-1" >•</span> {voo.trecho}</p >
                </div>
                </div>
                < div className = "flex justify-between items-end bg-[#E8F2FA] p-3 rounded-lg border border-[#C8DCED]/50" >
                    <div>
                    <p className="text-[9px] text-[#2C4A6E] font-bold uppercase tracking-wider mb-1" > Companhia & Voo </p>
                        < p className = "font-bold text-[#1A2B47] text-sm break-words" > { voo.cia } { voo.voo } </p>
                            </div>
                            < div className = "text-right" >
                                <p className="text-[9px] text-[#2C4A6E] font-bold uppercase tracking-wider mb-1" > Horário </p>
                                    < p className = "font-bold text-[#1A2B47] text-sm break-words" > { voo.horario } </p>
                                        </div>
                                        </div>
                                        </div>
                               ))}
</div>

    < div className = "text-center mt-auto pt-6 border-t border-[#1A2B47]/10" >
        <p className="text-[10px] text-[#1A2B47]/40 uppercase tracking-widest font-medium" > Documento Oficial de Viagem • Excelência Tour </p>
            </div>
            </div>
            </div>
                      )}

{/* PÁGINA 3: HOSPEDAGEM */ }
{
    data.hospedagem.length > 0 && (
        <div className="story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#E8F2FA' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-6 pb-6 border-b border-[#1A2B47]/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#1A2B47] rounded-xl flex items-center justify-center shrink-0" >
                <Building size={ 24 } className = "text-[#6EC3EC]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-[#1A2B47] leading-none" > Hospedagem </h2>
                        < p className = "text-[10px] text-[#2C4A6E] uppercase tracking-widest font-bold mt-1" > Alojamento Confirmado </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >
                            {
                                data.hospedagem.map((h, i) => (
                                    <div key= { i } className = "bg-white p-5 rounded-2xl border border-[#C8DCED]/50" >
                                    <SectionIdBadge id={ h.localizador } />
                                <p className="text-[10px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-1" > Estabelecimento </p>
                                < p className = "font-display font-bold text-[#1A2B47] text-2xl leading-tight mb-4 break-words" > { h.nome } </p>

                                < div className = "flex gap-4 mb-4" >
                                <div className="flex-1 bg-[#F5F0EB] p-3 rounded-lg border border-[#EAEAEA]" >
                                <p className="text-[9px] text-[#2C4A6E] font-bold uppercase tracking-wider mb-1" > Check -in </p>
                                < p className = "font-bold text-[#1A2B47] text-sm break-words" > { h.checkin } </p>
                                </div>
                                < div className = "flex-1 bg-[#F5F0EB] p-3 rounded-lg border border-[#EAEAEA]" >
                                <p className="text-[9px] text-[#2C4A6E] font-bold uppercase tracking-wider mb-1" > Check - out </p>
                                < p className = "font-bold text-[#1A2B47] text-sm break-words" > { h.checkout } </p>
                                </div>
                                </div>

                                < div className = "bg-[#1A2B47] text-white px-4 py-2.5 rounded-lg inline-block w-full" >
                                <span className="text-[10px] text-[#6EC3EC] font-bold uppercase tracking-widest mr-2" > Regime: </span>
                                < span className = "font-medium text-sm break-words" > { h.regime } </span>
                                </div>
                                </div>
                                ))
                            }
                                </div>

                                < div className = "text-center mt-auto pt-6 border-t border-[#1A2B47]/10" >
                                    <p className="text-[10px] text-[#1A2B47]/40 uppercase tracking-widest font-medium" > Documento Oficial de Viagem • Excelência Tour </p>
                                        </div>
                                        </div>
                                        </div>
                      )}

{/* PÁGINA 4: TRANSPORTE */ }
{
    data.transporte.length > 0 && (
        <div className="story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FFFFFF' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-6 pb-6 border-b border-[#1A2B47]/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#2C4A6E] rounded-xl flex items-center justify-center shrink-0" >
                <Car size={ 24 } className = "text-[#F5F0EB]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-[#1A2B47] leading-none" > Transporte </h2>
                        < p className = "text-[10px] text-[#6EC3EC] uppercase tracking-widest font-bold mt-1" > Transfers & Deslocamentos </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >
                            {
                                data.transporte.map((t, i) => (
                                    <div key= { i } className = "bg-[#F5F0EB] p-5 rounded-2xl border border-slate-200" >
                                    <SectionIdBadge id={ t.localizador } />

                                <p className="text-[10px] text-[#2C4A6E] font-bold uppercase tracking-wider mb-1" > Serviço Contratado </p>
                                < p className = "font-bold text-[#1A2B47] text-lg leading-snug mb-4 break-words" > { t.detalhes } </p>

                                < div className = "space-y-3" >
                                <div className="bg-white p-4 rounded-xl flex gap-3 items-start border-l-[3px] border-[#1A2B47] shadow-sm" >
                                <Building size={ 16} className = "text-[#1A2B47] shrink-0 mt-0.5" />
                                <div>
                                <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Empresa Fornecedora </p>
                                < p className = "font-bold text-[#1A2B47] text-sm break-words" > { t.fornecedor || "--" } </p>
                                </div>
                                </div>
                                < div className = "bg-white p-4 rounded-xl flex gap-3 items-start border-l-[3px] border-[#6EC3EC] shadow-sm" >
                                <MapPin size={ 16} className = "text-[#6EC3EC] shrink-0 mt-0.5" />
                                <div>
                                <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Ponto de Encontro / Endereço </p>
                                < p className = "font-medium text-[#1A2B47] text-sm break-words whitespace-pre-wrap" > { t.pontoEncontro || "Consulte as instruções ou aguarde com a placa no desembarque." } </p>
                                </div>
                                </div>
                                     {
                                        t.telefone && (
                                            <div className="bg-[#E8F2FA] p-4 rounded-xl flex gap-3 items-center border-l-[3px] border-[#2C4A6E]">
                                                <Phone size={ 16} className = "text-[#2C4A6E] shrink-0" />
                                                <div>
                                                <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Telefone / WhatsApp </p>
                                < p className = "font-bold text-[#1A2B47] text-sm break-words" > { t.telefone } </p>
                                </div>
                                </div>
                                )
                            }
                                </div>
                                </div>
                               ))}
</div>

    < div className = "text-center mt-auto pt-6 border-t border-[#1A2B47]/10" >
        <p className="text-[10px] text-[#1A2B47]/40 uppercase tracking-widest font-medium" > Documento Oficial de Viagem • Excelência Tour </p>
            </div>
            </div>
            </div>
                      )}

{/* PÁGINA 5: PASSEIOS */ }
{
    data.passeios.length > 0 && (
        <div className="story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FFFFFF' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-6 pb-6 border-b border-[#1A2B47]/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#6EC3EC] rounded-xl flex items-center justify-center shrink-0" >
                <Map size={ 24 } className = "text-[#1A2B47]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-[#1A2B47] leading-none" > Passeios </h2>
                        < p className = "text-[10px] text-[#2C4A6E] uppercase tracking-widest font-bold mt-1" > Tours & Experiências </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >
                            {
                                data.passeios.map((p, i) => (
                                    <div className= "bg-[#E8F2FA] p-5 rounded-2xl border border-[#C8DCED]/50" key = { i } >
                                    <SectionIdBadge id={ p.localizador } />

                                <p className="text-[10px] text-[#2C4A6E] font-bold uppercase tracking-wider mb-1" > Atividade </p>
                                < p className = "font-bold text-[#1A2B47] text-lg leading-snug mb-2 break-words" > { p.nome } </p>
                                < p className = "text-[#1A2B47] text-sm font-medium mb-4" > { p.data } </p>

                                < div className = "space-y-3" >
                                <div className="bg-white p-4 rounded-xl flex gap-3 items-start border-l-[3px] border-[#1A2B47] shadow-sm" >
                                <Building size={ 16} className = "text-[#1A2B47] shrink-0 mt-0.5" />
                                <div>
                                <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Operador Local </p>
                                < p className = "font-bold text-[#1A2B47] text-sm break-words" > { p.fornecedor } </p>
                                </div>
                                </div>
                                < div className = "bg-white p-4 rounded-xl flex gap-3 items-start border-l-[3px] border-[#6EC3EC] shadow-sm" >
                                <MapPin size={ 16} className = "text-[#6EC3EC] shrink-0 mt-0.5" />
                                <div>
                                <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Ponto de Encontro / Horário </p>
                                < p className = "font-medium text-[#1A2B47] text-sm break-words whitespace-pre-wrap" > { p.pontoEncontro } </p>
                                </div>
                                </div>
                                     {
                                        p.telefone && (
                                            <div className="bg-white p-4 rounded-xl flex gap-3 items-center border-l-[3px] border-[#2C4A6E] shadow-sm">
                                                <Phone size={ 16} className = "text-[#2C4A6E] shrink-0" />
                                                <div>
                                                <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Telefone </p>
                                < p className = "font-bold text-[#1A2B47] text-sm break-words" > { p.telefone } </p>
                                </div>
                                </div>
                                )
                            }
                                </div>
                                </div>
                               ))}
</div>

    < div className = "text-center mt-auto pt-6 border-t border-[#1A2B47]/10" >
        <p className="text-[10px] text-[#1A2B47]/40 uppercase tracking-widest font-medium" > Documento Oficial de Viagem • Excelência Tour </p>
            </div>
            </div>
            </div>
                      )}

{/* PÁGINA 6: SEGURO VIAGEM */ }
{
    data.seguro.length > 0 && (
        <div className="story-page text-white relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#C0392B' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-6 pb-6 border-b border-white/20 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0" >
                <Shield size={ 24 } className = "text-[#C0392B]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-white leading-none" > Seguro Viagem </h2>
                        < p className = "text-[10px] text-white/70 uppercase tracking-widest font-bold mt-1" > Sua Proteção </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >
                            {
                                data.seguro.map((s, i) => (
                                    <div key= { i } className = "p-6 rounded-2xl border border-white/20" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }} >
                                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider mb-1" > Seguradora </p>
                                    < p className = "font-display font-bold text-white text-2xl leading-tight mb-4 break-words" > { s.seguradora } </p>

                                        < div className = "bg-white text-[#C0392B] p-4 rounded-xl mb-4 text-center border border-white/40" >
                                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70" > Número da Apólice </p>
                                                < p className = "font-bold text-lg" > { s.apolice || "Aguardando Apólice" } </p>
                                                    </div>

                                                    < div className = "space-y-3" >
                                                        <div>
                                                        <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider mb-0.5" > Plano / Cobertura </p>
                                                            < p className = "font-medium text-white text-sm break-words" > { s.cobertura } </p>
                                                                </div>
                                                                < div className = "pt-3 border-t border-white/20" >
                                                                    <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1" > <Phone size={ 10 } /> Central 24h de Emergência</p >
                                                                        <p className="font-bold text-white text-xl break-words" > { s.telefone } </p>
                                                                            </div>
                                                                            </div>
                                                                            </div>
                               ))}
</div>

    < div className = "text-center mt-auto pt-6 border-t border-white/20" >
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium" > Documento Oficial de Viagem • Excelência Tour </p>
            </div>
            </div>
            </div>
                      )}

</div>
                 )}

{/* =========================================
                      ABA 2: INFORMAÇÕES DE EMBARQUE (FIXAS E INTEGRAIS)
                 =========================================== */}
{
    activeTab === 'embarque' && (
        <div 
                      ref={ embarquePagesRef }
    className = "flex flex-wrap justify-center gap-10 pb-20 w-full items-start"
        >
        {/* EMBARQUE: PÁGINA 1 */ }
        < div className = "story-page text-white relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#1A2B47' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-8 pb-6 border-b border-white/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#6EC3EC] rounded-xl flex items-center justify-center shrink-0" >
                <Info size={ 24 } className = "text-[#1A2B47]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-white leading-none" > Informações </h2>
                        < p className = "text-[10px] text-[#6EC3EC] uppercase tracking-widest font-bold mt-1" > Guia Essencial(Pág 1 / 2) </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-6 pb-6" >

                                {/* Documentação */ }
                                < div className = "p-5 rounded-2xl border border-white/10" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <div className="flex items-center gap-3 mb-3" >
                                        <ShieldCheck size={ 20 } className = "text-[#6EC3EC]" />
                                            <h3 className="font-bold text-base text-white" > Documentação </h3>
                                                </div>
                                                < p className = "text-sm text-white/80 leading-snug" >
                                                    Para embarcar, entrar no hotel e realizar os passeios, é necessário apresentar um < strong > documento oficial com foto(RG ou CNH original) < /strong>. São aceitos também título de eleitor e carteira de trabalho (se contiverem foto). Para voos internacionais (fora Mercosul), <strong>Passaporte válido</strong > é obrigatório.
                               </p>
                                                        </div>

{/* Bagagem e Líquidos */ }
<div className="p-5 rounded-2xl border border-white/10" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
    <div className="flex items-center gap-3 mb-3" >
        <Luggage size={ 20 } className = "text-[#6EC3EC]" />
            <h3 className="font-bold text-base text-white" > Bagagem e Líquidos </h3>
                </div>
                < p className = "text-sm text-white/80 leading-snug mb-3" >
                    Cada adulto / criança pode levar < strong > uma bagagem de mão de até 10kg </strong> (medidas máximas: 55x35x25cm), além de uma bolsa ou mochila (item pessoal). A bagagem despachada (23kg) tem custo extra, caso não esteja incluída.
                        </p>
                        < div className = "bg-[#0F1C2E] p-3 rounded-xl border border-white/5" >
                            <p className="text-xs text-white/70 leading-snug" >
                                   🧴 <strong>Líquidos: </strong> Em voos nacionais, você pode levar frascos na mala de mão, desde que o somatório não ultrapasse 1 litro por bagagem.
    </p>
    </div>
    </div>

{/* Chegada ao Aeroporto */ }
<div className="p-5 rounded-2xl border border-white/10" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
    <div className="flex items-center gap-3 mb-3" >
        <Clock size={ 20 } className = "text-[#6EC3EC]" />
            <h3 className="font-bold text-base text-white" > Chegada ao Aeroporto </h3>
                </div>
                < p className = "text-sm text-white/80 leading-snug" >
                    Recomendamos chegar com pelo menos < strong > 1h30 de antecedência </strong> em voos nacionais. O check-in online não é obrigatório, mas abre 48h antes e agiliza muito o processo no dia!
                        </p>
                        </div>

                        </div>

                        < div className = "text-center mt-auto pt-6 border-t border-white/10" >
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium" > Equipe Excelência Tour Chapecó </p>
                                </div>
                                </div>
                                </div>

{/* EMBARQUE: PÁGINA 2 */ }
<div className="story-page text-white relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#1A2B47' }}>
    <div className="relative z-10 flex flex-col min-h-full" >
        <div className="mb-8 pb-6 border-b border-white/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#6EC3EC] rounded-xl flex items-center justify-center shrink-0" >
                <Info size={ 24 } className = "text-[#1A2B47]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-white leading-none" > Embarque </h2>
                        < p className = "text-[10px] text-[#6EC3EC] uppercase tracking-widest font-bold mt-1" > Guia Essencial(Pág 2 / 2) </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-6 pb-6" >

                                {/* Voucher e Traslados */ }
                                < div className = "p-5 rounded-2xl border border-white/10" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <div className="flex items-center gap-3 mb-3" >
                                        <Car size={ 20 } className = "text-[#6EC3EC]" />
                                            <h3 className="font-bold text-base text-white" > Chegada e Traslados </h3>
                                                </div>
                                                < p className = "text-sm text-white/80 leading-snug mb-3" >
                                                    <strong>Não é necessário imprimir o voucher </strong>, basta apresentar o PDF no celular.
                                                        </p>
                                                        < p className = "text-sm text-white/80 leading-snug" >
                                                            A equipe de traslado estará esperando geralmente após o portão de desembarque, segurando uma placa com o nome dos passageiros ou da operadora(ex: Orinter, FRT).Em caso de desencontro, verifique os contatos de emergência no seu voucher.
                               </p>
                                                                </div>

{/* Passeios */ }
<div className="p-5 rounded-2xl border border-white/10" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
    <div className="flex items-center gap-3 mb-3" >
        <Map size={ 20 } className = "text-[#6EC3EC]" />
            <h3 className="font-bold text-base text-white" > Passeios Locais </h3>
                </div>
                < p className = "text-sm text-white/80 leading-snug" >
                    Se você já possui passeios contratados, eles geralmente são realizados pela mesma empresa do traslado.Logo na ida até o hotel, você já pode alinhar os horários com o guia.Caso deseje incluir novos roteiros, feche diretamente com eles!
                        </p>
                        </div>

{/* Chimarrao */ }
<div className="p-5 rounded-2xl border border-[#6EC3EC]/40" style = {{ backgroundColor: 'rgba(110, 195, 236, 0.15)' }}>
    <div className="flex items-center gap-3 mb-3" >
        <HelpCircle size={ 20 } className = "text-[#6EC3EC]" />
            <h3 className="font-bold text-base text-white" > Posso levar Chimarrão ? </h3>
                </div>
                < p className = "text-sm text-white/80 leading-snug" >
                    <strong>Sim! < /strong> É permitido levar cuia, bomba e erva-mate no avião. A erva deve pesar até 1kg por bagagem e estar lacrada/bem embalada. < strong > A garrafa térmica deve estar completamente VAZIA </strong> ao passar pelo raio-x de segurança.
                        </p>
                        </div>

                        </div>

                        < div className = "text-center mt-auto pt-6 border-t border-white/10" >
                            <p className="text-sm font-bold text-white mb-1" > Desejamos uma viagem incrível! </p>
                                < p className = "text-[10px] text-white/40 uppercase tracking-widest font-medium" > Equipe Excelência Tour Chapecó </p>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                 )}

{/* =========================================
                      ABA 3: TERCEIRO DOCUMENTO - EMERGÊNCIA E ÚTEIS
                 =========================================== */}
{
    activeTab === 'emergencia' && (
        <div 
                      ref={ emergenciaPagesRef }
    className = "flex flex-wrap justify-center gap-10 pb-20 w-full items-start"
        >
        {/* PÁGINA 1: CONTATOS DO VOUCHER */ }
        < div className = "story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#1A2B47' }
}>
    <div className="relative z-10 flex flex-col min-h-full" >

        <div className="mb-8 pb-6 border-b border-red-500/30 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg" >
                <Siren size={ 24 } className = "text-white" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-white leading-none" > Emergência </h2>
                        < p className = "text-[10px] text-red-400 uppercase tracking-widest font-bold mt-1" > Guia de Contatos do Pacote </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >
                            {
                                data.contatosEmergencia.length === 0 ? (
                                    <div className= "text-center text-white/50 mt-10" >
                                    Nenhum contato local mapeado automaticamente.Adicione no painel lateral.
                               </div>
                             ) : (
                                        data.contatosEmergencia.map((c, i) => (
                                            <div key= { i } className = "p-5 rounded-2xl border border-white/10" style = {{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <p className="text-[10px] text-[#6EC3EC] font-bold uppercase tracking-wider mb-2" > { c.categoria } </p>
                                        < p className = "font-bold text-white text-lg leading-tight mb-3 break-words" > { c.nome } </p>

                                        < div className = "bg-white p-4 rounded-xl flex gap-3 items-center border-l-4 border-red-500 shadow-md" >
                                        <PhoneCall size={ 18} className = "text-red-500 shrink-0" />
                                        <div>
                                        <p className="text-[9px] text-[#8BA3BB] font-bold uppercase tracking-wider mb-0.5" > Telefone / WhatsApp </p>
                                        < p className = "font-bold text-[#1A2B47] text-lg break-words" > { c.telefone } </p>
                                        </div>
                                        </div>
                                        </div>
                                        ))
)}
</div>

    < div className = "text-center mt-auto pt-6 border-t border-white/10" >
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium" > Documento de Apoio • Excelência Tour </p>
            </div>
            </div>
            </div>

{/* PÁGINA 2: NÚMEROS DE ÓRGÃOS PÚBLICOS E CIAS AÉREAS (Fixo para Brasil) */ }
<div className="story-page relative flex flex-col p-8 overflow-hidden" style = {{ width: '400px', minHeight: '711px', height: 'max-content', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#F5F0EB' }}>
    <div className="relative z-10 flex flex-col min-h-full" >

        <div className="mb-6 pb-6 border-b border-[#1A2B47]/10 flex items-center gap-4 shrink-0" >
            <div className="w-12 h-12 bg-[#1A2B47] rounded-xl flex items-center justify-center shrink-0 shadow-lg" >
                <HeartPulse size={ 24 } className = "text-[#6EC3EC]" />
                    </div>
                    < div >
                    <h2 className="text-3xl font-display font-bold text-[#1A2B47] leading-none" > Utilidade </h2>
                        < p className = "text-[10px] text-[#2C4A6E] uppercase tracking-widest font-bold mt-1" > Órgãos Públicos Nacionais </p>
                            </div>
                            </div>

                            < div className = "flex-1 space-y-4 pb-6" >

                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8BA3BB] mb-2" > Emergências / Brasil </h3>

                                    < div className = "grid grid-cols-2 gap-3 mb-6" >
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center" >
                                            <p className="font-display font-bold text-2xl text-red-600 leading-none mb-1" > 192 </p>
                                                < p className = "text-[10px] font-bold text-[#1A2B47] uppercase" > SAMU </p>
                                                    </div>
                                                    < div className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center" >
                                                        <p className="font-display font-bold text-2xl text-[#1A2B47] leading-none mb-1" > 190 </p>
                                                            < p className = "text-[10px] font-bold text-[#1A2B47] uppercase" > Polícia Militar </p>
                                                                </div>
                                                                < div className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center" >
                                                                    <p className="font-display font-bold text-2xl text-[#C0392B] leading-none mb-1" > 193 </p>
                                                                        < p className = "text-[10px] font-bold text-[#1A2B47] uppercase" > Bombeiros </p>
                                                                            </div>
                                                                            < div className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center" >
                                                                                <p className="font-display font-bold text-2xl text-[#2C4A6E] leading-none mb-1" > 191 </p>
                                                                                    < p className = "text-[10px] font-bold text-[#1A2B47] uppercase" > Polícia Rodov.</p>
                                                                                        </div>
                                                                                        < div className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center" >
                                                                                            <p className="font-display font-bold text-2xl text-[#2C4A6E] leading-none mb-1" > 199 </p>
                                                                                                < p className = "text-[10px] font-bold text-[#1A2B47] uppercase" > Defesa Civil </p>
                                                                                                    </div>
                                                                                                    < div className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center" >
                                                                                                        <p className="font-display font-bold text-2xl text-[#2C4A6E] leading-none mb-1" > 194 </p>
                                                                                                            < p className = "text-[10px] font-bold text-[#1A2B47] uppercase" > Polícia Federal </p>
                                                                                                                </div>
                                                                                                                </div>

                                                                                                                < div className = "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-4" >
                                                                                                                    <h3 className="font-bold text-[#1A2B47] text-base mb-2" > Perda de Documentos </h3>
                                                                                                                        < p className = "text-sm text-slate-600 leading-snug" >
                                                                                                                            Em caso de perda ou roubo de documentos(RG / CNH) no aeroporto ou destino, registre imediatamente um < strong > Boletim de Ocorrência(B.O.) </strong>. A maioria dos estados permite fazer o B.O. online. O B.O. serve como documento de embarque provisório para retornar à sua origem em voos nacionais.
                                                                                                                                </p>
                                                                                                                                </div>

                                                                                                                                </div>

                                                                                                                                < div className = "text-center mt-auto pt-6 border-t border-[#1A2B47]/10" >
                                                                                                                                    <p className="text-[10px] text-[#1A2B47]/40 uppercase tracking-widest font-medium" > Documento de Apoio • Excelência Tour </p>
                                                                                                                                        </div>
                                                                                                                                        </div>
                                                                                                                                        </div>

                                                                                                                                        </div>
                 )}

{/* =========================================
                      ABA 4: PREVIEW MENSAGEM WHATSAPP
                 =========================================== */}
{
    activeTab === 'whatsapp' && (
        <div className="w-full max-w-2xl bg-white rounded-2xl p-6 md:p-8 border border-slate-200 self-start shadow-sm" >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4" >
                <h3 className="font-bold text-[#1A2B47] flex items-center gap-2" > <MessageCircle className="text-[#2D7A47]" /> Texto para o Cliente </h3>
                    < button onClick = { copyWhatsApp } className = {`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${copied ? 'bg-[#E0F4E8] text-[#2D7A47]' : 'bg-[#2D7A47] text-white hover:bg-[#1B5E32]'}`
}>
    { copied?<>< CheckCircle size = { 16} /> Copiado! < /> : <><Copy size={16}/ > Copiar Texto </>}
</button>
    </div>
    < div className = "bg-[#E8F2FA] p-5 rounded-xl text-[#1A2B47] text-[14px] leading-relaxed whitespace-pre-wrap font-sans" >
        { generateWhatsAppText() }
        </div>
        </div>
                 )}
</>
             )}
</div>
    </section>

    </main>
    </div>
  );
}

// COMPONENTES AUXILIARES UI

const SectionTitle = ({ icon, title }) => (
    <h2 className= "text-[11px] font-black uppercase tracking-[0.15em] text-[#1A2B47] flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 mt-6" >
    <span className="text-[#6EC3EC]" > { icon } </span> {title}
        </h2>
);

const InputField = ({ label, value, onChange, placeholder, noLabel }) => (
    <div className= "w-full" >
    {!noLabel && <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8BA3BB] mb-1.5 block" > { label } </label>}
<input 
      type="text"
value = { value || ""}
onChange = {(e) => onChange(e.target.value)}
placeholder = { placeholder || `Inserir ${label?.toLowerCase()}`}
className = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#1A2B47] font-medium focus:outline-none focus:ring-2 focus:ring-[#6EC3EC] focus:border-transparent transition-all"
    />
    </div>
);