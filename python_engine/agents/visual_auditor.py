import asyncio
import os
import base64
from playwright.async_api import async_playwright
import google.generativeai as genai

# Configuração do Agente AURA (Visual & UX Auditor)
# Utiliza Vision para avaliar se a interface está seguindo o Bento Grid e Flat Design.

def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def capture_and_audit(url: str, output_image: str = "audit_screenshot.png"):
    print(f"[AURA] Iniciando navegação headless para {url}...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        try:
            await page.goto(url, wait_until="networkidle")
            await page.screenshot(path=output_image, full_page=True)
            print(f"[AURA] Screenshot capturado com sucesso: {output_image}")
        except Exception as e:
            print(f"[AURA] Erro ao capturar a página: {e}")
            await browser.close()
            return
            
        await browser.close()

    # 2. Análise Visual com Inteligência Artificial
    print("[AURA] Invocando LLM Vision para auditoria de UI/UX...")
    
    # Assumindo que a chave de API do Gemini/OpenAI esteja nas variáveis de ambiente
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[AURA] GEMINI_API_KEY não encontrada. Pulando a análise de IA e salvando apenas a imagem.")
        return
        
    genai.configure(api_key=api_key)
    
    # Prepara a imagem para o Gemini Vision
    import PIL.Image
    img = PIL.Image.open(output_image)
    
    prompt = """
    Você é o agente [AURA], um especialista nível Sênior em UI/UX e Design de Interfaces.
    Avalie a imagem desta interface do sistema Turis Agencias (Omega Bento v3.0).
    Verifique estritamente as novas regras de design:
    - **Proibido Gradientes**: Tudo deve ser Flat Design com cores sólidas e harmoniosas.
    - **Proibido Sombras**: O sistema deve ser limpo, usando bordas sutis (1px) ao invés de box-shadows.
    - **Arredondamento Consistente**: Usar `rounded-xl` (aprox. 12px-16px). Evite o `rounded-3xl` ou `2rem` exagerados.
    - **Espaçamento Profissional**: Padding/margin que crie uma sensação de respiro sem ser vazio demais.
    - **Tipografia**: Hierarquia clara usando fontes modernas (Inter/Outfit).
    
    Identifique falhas visuais, botões mal alinhados ou violações do design system, e gere um relatório de melhorias em Markdown.
    """
    
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    print("[AURA] Analisando estrutura visual profunda...")
    
    response = model.generate_content([prompt, img])
    
    report_path = "audit_report_aura.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(response.text)
        
    print(f"[AURA] Auditoria concluída! Relatório gerado em: {report_path}")

if __name__ == "__main__":
    # Exemplo: Auditando a página de cotações local (se estiver rodando)
    asyncio.run(capture_and_audit("http://localhost:5173/quotations"))
