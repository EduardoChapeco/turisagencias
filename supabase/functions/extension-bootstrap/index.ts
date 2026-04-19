import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  resolveExtensionContext,
  ensureTaskBoard,
  getExtensionAiConfig,
  issueExtensionSession,
} from '../_shared/extension.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const context = await resolveExtensionContext(req);
    const [taskBoard, aiConfig] = await Promise.all([
      ensureTaskBoard(context.supabase, context.orgId),
      getExtensionAiConfig(context.supabase, context.orgId),
    ]);
    const extensionSession = await issueExtensionSession(context, req);

    return jsonResponse({
      userId: context.userId,
      profileId: context.profileId,
      orgId: context.orgId,
      agentName: context.agentName,
      email: context.email,
      appUrl: req.headers.get('origin') || null,
      taskBoardId: taskBoard.boardId,
      taskBoardName: taskBoard.boardName,
      taskColumnId: taskBoard.defaultColumnId,
      taskDoneColumnId: taskBoard.doneColumnId,
      backend: {
        mode: 'platform_edge_functions',
        supabase_url: SUPABASE_URL,
        supabase_anon_key: SUPABASE_ANON_KEY,
        sync_url: `${SUPABASE_URL}/functions/v1/extension-sync`,
        quotation_url: `${SUPABASE_URL}/functions/v1/ext-process-quotation`,
        ai_chat_url: `${SUPABASE_URL}/functions/v1/ai-chat-agent`,
        extension_session_required: true,
      },
      extension_session: extensionSession,
      ai: aiConfig
        ? {
            provider: aiConfig.provider,
            api_base: aiConfig.apiBase,
            model: aiConfig.model,
            mode: 'platform_agent',
          }
        : null,
      capabilities: {
        sso: true,
        platformSync: true,
        clientLookup: true,
        clientSearch: true,
        clientUpsert: true,
        travelers: true,
        documents: true,
        financial: true,
        taskBoard: true,
        demands: true,
        tripImport: true,
        tickets: true,
        quotationProcessing: true,
        emailLinking: true,
        proactiveAlerts: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === 'Unauthorized' ? 401 : 400;
    return errorResponse(message, status);
  }
});
