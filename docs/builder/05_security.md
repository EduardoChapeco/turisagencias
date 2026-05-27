# Segurança do Builder

## Vetores de Ataque e Mitigações

1. **XSS em Rich Text / Componentes de Texto**
   - **Risco**: Agentes mal-intencionados podem inserir `<script>` tags no conteúdo das páginas que serão renderizadas publicamente ou no painel do administrador.
   - **Mitigação**: O `renderer_public` de qualquer componente que aceite HTML (ex: Block de Texto Rico) deve forçar a higienização com `DOMPurify` antes de aplicar ao DOM.

2. **XSS em Botões (Protocolo `javascript:`)**
   - **Risco**: Botões CTA podem ter URLs definidas como `javascript:alert('hack')`.
   - **Mitigação**: O helper `sanitizeHref` deve bloquear qualquer URL que inicie com `javascript:` ou `data:text/html`. Somente `http:`, `https:`, `mailto:`, `tel:` ou caminhos relativos `/` são permitidos.

3. **Upload de SVG Malicioso**
   - **Risco**: SVGs podem conter payloads `<script>` embedded.
   - **Mitigação**: Bloquear uploads diretos de `.svg` via restrições do Supabase Storage Policy ou higienizá-los server-side antes de retornar a URL pública.

4. **SSRF via RSS Feeds / Integrações Externas**
   - **Risco**: Se o CMS tiver blocos que puxem conteúdo de URLs fornecidas pelo usuário, pode ser usado para forjar requisições em nome do servidor interno.
   - **Mitigação**: Todo fetch server-side de recursos externos deve passar por uma Edge Function de proxy que bloqueie acessos a IPs internos (ex: `127.0.0.1`, `169.254.169.254`).

5. **Acesso Indevido a Rascunhos (Preview Token)**
   - **Risco**: Vizualizar rascunhos de outras agências alterando parâmetros na URL.
   - **Mitigação**: `builder_page_versions` RLS deve restringir a leitura apenas se o `org_id` da página pertencer ao JWT do usuário solicitante. Visitantes não-autenticados só podem ler versões onde o status for `published`.

## Inteligência Artificial (Contexto Builder)
A IA pode sugerir Títulos, SEO, FAQ, Alt Text.
**A IA NÃO PODE:** Publicar uma versão do banco autonomamente (ações destrutivas ou de estado final dependem de autorização manual baseada em token de sessão - JWT do Admin).
