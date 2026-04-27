import asyncio
import os
import base64
from playwright.async_api import async_playwright
import google.generativeai as genai
from typing import Optional

# ==========================================
# 🧠 AURA v4.1 - COGNITIVE VISUAL AUDITOR (SHADOWLESS)
# ==========================================

async def capture_and_audit(url: str, output_image: str = "audit_screenshot.png"):
    """
    [AURA] - Agente Auditor Visual de Interface.
    Evoluído na v4.1 para auditar a Lei Pétrea de Design da Turis Agências: 
    ZERO sombras e ZERO scrollbars, mantendo a sofisticação Premium.
    """
    print(f"\n[👁️ AURA] Iniciando Percepção Multimodal Shadowless em: {url}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)
        
        try:
            print("[AURA] Renderizando DOM...")
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await asyncio.sleep(2) 
            await page.screenshot(path=output_image, full_page=True)
            print(f"[AURA] Snapshot capturado: {output_image}")
        except Exception as e:
            print(f"[AURA Critical Error] Falha na percepção visual: {e}")
            await browser.close()
            return
            
        await browser.close()

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[AURA Warning] GEMINI_API_KEY ausente.")
        return
        
    genai.configure(api_key=api_key)
    import PIL.Image
    img = PIL.Image.open(output_image)
    
    prompt = """
    Você é o Agente [AURA v4.1], Arquiteto de Design e Especialista em Neurodesign da Turis Agências.
    Sua missão é auditar esta interface sob as Leis Pétreas do sistema:

    <LEIS PÉTREAS DE DESIGN Turis AI v4.1>
    1. ZERO SOMBRAS (box-shadow): É PROIBIDO o uso de sombras em qualquer elemento. A profundidade deve ser comunicada via bordas (1px solid), contrastes de cores neutras e transparências.
    2. ZERO SCROLLBARS: Nenhuma barra de rolagem deve ser visível, mesmo em áreas com scroll interno.
    3. BENTO GRID PREMIUM: Use raios de curvatura acentuados (rounded-2xl / 2rem) para criar uma malha orgânica e moderna.
    4. GLASSMORPHISM SÓBRIO: Use transparências e desfoque de fundo (backdrop-blur) sem depender de sombras para destacar elementos.
    5. RESPIRO E HIERARQUIA: Verifique se os espaçamentos (paddings/margins) são amplos o suficiente para uma experiência de luxo.

    Identifique qualquer violação (especialmente sombras indesejadas) e sugira o CSS exato para correção.
    Retorne um relatório Markdown profissional intitulado 'AUDITORIA VISUAL Turis AI v4.1 - SHADOWLESS'.
    """
    
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    print("[AURA] Analisando conformidade com as Leis Pétreas...")
    
    try:
        response = model.generate_content([prompt, img])
        report_path = "audit_report_aura_v4_1.md"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"[AURA Success] Auditoria Shadowless Concluída: {report_path}")
    except Exception as e:
        print(f"[AURA Error] Erro na geração multimodal: {e}")

if __name__ == "__main__":
    import sys
    url_to_audit = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"
    asyncio.run(capture_and_audit(url_to_audit))
