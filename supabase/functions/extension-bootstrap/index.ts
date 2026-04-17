import { corsHeaders, errorResponse, jsonResponse, resolveExtensionContext, ensureTaskBoard } from '../_shared/extension.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const context = await resolveExtensionContext(req);
    const taskBoard = await ensureTaskBoard(context.supabase, context.orgId);

    return jsonResponse({
      userId: context.userId,
      profileId: context.profileId,
      orgId: context.orgId,
      agentName: context.agentName,
      email: context.email,
      taskBoardId: taskBoard.boardId,
      taskBoardName: taskBoard.boardName,
      taskColumnId: taskBoard.defaultColumnId,
      taskDoneColumnId: taskBoard.doneColumnId,
      capabilities: {
        clientLookup: true,
        clientUpsert: true,
        tripImport: true,
        tickets: true,
        taskBoard: true,
        quotationProcessing: true,
        emailLinking: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === 'Unauthorized' ? 401 : 400;
    return errorResponse(message, status);
  }
});
