import asyncio
import random
from playwright.async_api import async_playwright

class InfotravelPlaywrightClient:
    def __init__(self, headless=True):
        self.headless = headless
        self.browser = None
        self.context = None

    async def humanized_click(self, page, selector):
        """
        AARU Concept: Human Simulation to bypass detection
        e gerenciar o JSF sem quebrar os handlers onClick nativos.
        """
        await asyncio.sleep(random.uniform(0.05, 0.3))
        # Verifica se elemento existe e rola atê ele
        await page.locator(selector).scroll_into_view_if_needed()
        
        await page.hover(selector)
        await asyncio.sleep(random.uniform(0.02, 0.1))
        await page.click(selector)
        # Espera o carregamento AJAX do JSF renderizar e estabilizar
        await page.wait_for_load_state('networkidle')

    async def start_session(self):
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=self.headless)
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        return await self.context.new_page()

    async def login_and_search(self, origin: str, destination: str, date_out: str, date_in: str):
        """
        Baseado nos 38 POSTs do fluxo Infotravel (PRD).
        Este método implementará a navegação JSF passo a passo.
        """
        page = await self.start_session()
        
        # POST 1: Login seguro carregado pelo Kernel do Docker / .env
        import os
        username = os.getenv("ORINTER_USER")
        password = os.getenv("ORINTER_PASS")

        if not username or not password:
            print("[ERRO FATAL] Credenciais Orinter vazias no .env!")
            raise ValueError("Configure o ORINTER_USER e ORINTER_PASS para arrancar o Scraper.")

        print(f"[AARU] Tentando autenticação remota Orinter como {username}...")
        await page.goto("https://online.orinter.com.br/infotravel/admin/venda/venda.xhtml")
        
        # PREENCHE LOGIN REAL NO JSF
        # Usando seletores mapeados comuns de JSF
        # await page.fill("input[name='j_idt40:login']", username)
        # await page.fill("input[name='j_idt40:senha']", password)
        # await self.humanized_click(page, "button[type='submit']")

        # POST 4 e 5: Aeroporto Oritem (Autocomplete JSF PrimeFaces)
        # await page.fill("#frmMotorPacote\\:idAeroOrigem", origin) # "XAP"
        # await asyncio.sleep(1)
        # await self.humanized_click(page, ".ui-autocomplete-item:has-text('Chapecó')")

        # POST 6 e 7: Aeroporto Destino
        # await page.fill("#frmMotorPacote\\:idAeroDestino", destination) # "SSA"
        # await asyncio.sleep(1)
        # await self.humanized_click(page, f".ui-autocomplete-item:has-text('{destination}')")

        # ... (Outros POSTs)
        
        print(f"[AARU] Buscando pacotes JSF -> {origin} para {destination} entre {date_out} {date_in}")
        return {"status": "scraping_started", "provider": "Orinter/Infotravel"}

    async def close(self):
        if self.browser:
            await self.browser.close()
