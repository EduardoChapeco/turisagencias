# Contract: UI vs Database Matrix

Este documento mapeia exatamente quais componentes UI e rotas chamam quais tabelas no banco de dados, estabelecendo o contrato de dependência de dados.

## Tabelas Acessadas Client-Side (Supabase `.from()`)

| Tabela | Arquivos Chamadores |
|---|---|
| `agency_testimonials` | components/builder/blocks/CarouselTestimonialsBlock.tsx |
| `agent_commission_entries` | pages/admin/CommissionReports.tsx, pages/finance/CommissionsPanel.tsx, pages/finance/MyCommissions.tsx |
| `ai_agents` | hooks/useAIAgents.ts, hooks/useAiTasks.ts |
| `ai_dashboard_summary` | hooks/useAIAgents.ts |
| `ai_decision_logs` | hooks/useAIInsights.ts, hooks/useQuotationScenarios.ts, pages/admin/AdminDashboard.tsx |
| `ai_keys_pool` | hooks/useAiKeys.ts |
| `ai_knowledge_base` | hooks/useKnowledgeBase.ts |
| `ai_tasks` | components/onboarding/BrandSquadLive.tsx, hooks/useAIAgents.ts, hooks/useAiTasks.ts, pages/admin/AdminDashboard.tsx |
| `b2b_credentials` | hooks/useB2bCredentials.ts, pages/Integrations.tsx, pages/settings/B2BTab.tsx |
| `b2c__profiles` | components/crm/B2CDigitalJourney.tsx, hooks/useB2CTracker.ts, pages/Analytics.tsx |
| `b2c_tracking_events` | components/ai/PublicB2CChat.tsx, components/crm/B2CDigitalJourney.tsx, hooks/useB2CTracker.ts, pages/Analytics.tsx |
| `blog_posts` | pages/BlogPublic.tsx, pages/admin/BlogAdmin.tsx |
| `boarding_pass_documents` | components/kanban/DepartureCardSheet.tsx |
| `booking_cancellations` | hooks/useBookingCancellations.ts |
| `booking_credits` | hooks/useBookingCredits.ts |
| `booking_installments` | hooks/useBookingCancellations.ts, hooks/useBookingPaymentProofs.ts, hooks/useGroupTripFinance.ts, hooks/useGroupTrips.ts |
| `booking_messages` | hooks/useBookingMessages.ts |
| `booking_payment_proofs` | hooks/useBookingPaymentProofs.ts |
| `bookings` | hooks/useBookingsPayments.ts |
| `builder_page_versions` | pages/PublicSiteView.tsx |
| `builder_pages` | pages/PublicSiteView.tsx |
| `builder_projects` | components/builder/VisualBuilder.tsx, components/builder/hooks/useSubmitForm.ts, domains/builder/repositories/builderRepository.ts, pages/Onboarding.tsx, pages/PublicSiteView.tsx, pages/TurisYouDashboard.tsx |
| `builder_sites` | pages/PublicSiteView.tsx |
| `builder_versions` | components/builder/VisualBuilder.tsx, domains/builder/repositories/builderRepository.ts, pages/Onboarding.tsx, pages/PublicSiteView.tsx |
| `bus_layouts` | hooks/useBusLayouts.ts |
| `bus_seat_assignments` | hooks/useGroupTripFinance.ts |
| `chat_sessions` | hooks/useChatSessions.ts |
| `checklist_items` | hooks/useChecklists.ts |
| `checklists` | hooks/useChecklists.ts |
| `client-media` | components/group-trips/ContractSignatureFlow.tsx, components/kanban/DepartureCardSheet.tsx, hooks/useBookingPaymentProofs.ts |
| `client-photos` | pages/PortalAiPhotos.tsx |
| `client_travel_credits` | hooks/useBookingCancellations.ts |
| `clients` | components/crm/FichaClienteMaster.tsx, hooks/useClients.ts, pages/Index.tsx, pages/ProposalEditor.tsx |
| `communication_rules` | hooks/useAutomations.ts, pages/automations/Automations.tsx |
| `contract_signatures` | pages/legal/SignatureCertificate.tsx |
| `contract_templates` | hooks/useContracts.ts |
| `contracts` | hooks/useContractRecords.ts |
| `destination_guides` | hooks/useGuides.ts, pages/GuideEdit.tsx, pages/PublicGuide.tsx |
| `destinations` | hooks/useDestinations.ts |
| `email_inbound` | hooks/useB2bCredentials.ts |
| `email_tracking_logs` | components/ui/EmailTrackingBadge.tsx, hooks/useEmailTracking.ts |
| `experiences` | hooks/usePoliciesAndExperiences.ts |
| `faq_items` | pages/HelpCenter.tsx |
| `feeds_master` | hooks/useAiRadar.ts |
| `feeds_user` | hooks/useAiRadar.ts |
| `financial_suppliers` | hooks/useFinance.ts |
| `financial_transactions` | hooks/useBookingCancellations.ts, hooks/useBookingPaymentProofs.ts, hooks/useFinance.ts, hooks/useGroupTripFinance.ts |
| `flight_segments` | hooks/useQuotations.ts |
| `flights` | hooks/useQuotations.ts |
| `global_iatas` | components/ui/LocationCombobox.tsx |
| `global_keys` | pages/admin/AdminDashboard.tsx |
| `group_bookings` | hooks/useBookingCancellations.ts, hooks/useBookingPaymentProofs.ts, hooks/useGroupTripFinance.ts, hooks/useGroupTrips.ts, pages/PortalManagerPage.tsx |
| `group_clients` | hooks/useGroupClients.ts |
| `group_installments` | hooks/useGroupInstallments.ts |
| `group_pricing` | hooks/useGroupPricing.ts |
| `group_trip_days` | hooks/useGroupTrips.ts |
| `group_trip_ledger` | hooks/useBookingCancellations.ts, hooks/useBookingPaymentProofs.ts, hooks/useGroupTripFinance.ts |
| `group_trips` | hooks/useGroupTripFinance.ts, hooks/useGroupTrips.ts, hooks/usePortal.ts, pages/Index.tsx, pages/PublicSiteView.tsx |
| `hotels_bank` | hooks/useHotels.ts, pages/HotelEdit.tsx |
| `itineraries` | hooks/useItineraries.ts, pages/PublicItinerary.tsx |
| `itinerary_days` | hooks/useQuotations.ts |
| `itinerary_items` | hooks/useQuotations.ts |
| `itinerary_leads` | pages/PublicItinerary.tsx |
| `itinerary_stops` | hooks/useItineraries.ts, pages/PublicItinerary.tsx |
| `kanban_boards` | components/crm/FichaClienteMaster.tsx, hooks/useKanbanBoards.ts, hooks/useSettings.ts |
| `kanban_cards` | components/crm/FichaClienteMaster.tsx, hooks/useKanbanBoards.ts |
| `kanban_checklist_items` | hooks/useKanbanBoards.ts |
| `kanban_checklists` | hooks/useKanbanBoards.ts |
| `kanban_columns` | hooks/useKanbanBoards.ts, hooks/useSettings.ts |
| `kanban_notes` | hooks/useKanbanBoards.ts |
| `kanban_tags` | hooks/useKanbanBoards.ts |
| `media` | components/ProposalAiImportSheet.tsx, components/QuotationAiImportSheet.tsx |
| `media_assets` | components/ui/MediaField.tsx |
| `news_article_versions` | components/builder/blocks/BlogPostGridBlock.tsx, pages/NewsCMS.tsx |
| `news_articles` | hooks/useAiRadar.ts |
| `news_sync_runs` | hooks/useAiRadar.ts |
| `notifications` | hooks/useNotifications.ts |
| `org-assets` | components/builder/MediaPicker.tsx, pages/Onboarding.tsx |
| `organizations` | components/AuthProvider.tsx, pages/BlogPublic.tsx, pages/HelpCenter.tsx, pages/Index.tsx, pages/Onboarding.tsx, pages/PortalManagerPage.tsx, pages/PublicItinerary.tsx, pages/PublicProposal.tsx, pages/PublicSiteView.tsx, pages/admin/AdminAgencyDetail.tsx, pages/admin/AdminDashboard.tsx |
| `payment-proofs` | hooks/useBookingsPayments.ts |
| `payments` | hooks/useBookingsPayments.ts, hooks/useFinance.ts |
| `policy_cache` | hooks/usePoliciesAndExperiences.ts |
| `portal_ai_photos` | pages/PortalAiPhotos.tsx |
| `profiles` | components/AuthProvider.tsx, domains/builder/repositories/builderRepository.ts, hooks/useKanbanBoards.ts, hooks/useSettings.ts, pages/Index.tsx, pages/Onboarding.tsx, pages/admin/AdminDashboard.tsx, pages/settings/AgentesTab.tsx |
| `proposal_versions` | hooks/useProposals.ts |
| `proposals` | hooks/useProposals.ts, pages/PublicProposal.tsx |
| `public_sites` | pages/Onboarding.tsx |
| `quotation_scenarios` | hooks/useQuotationScenarios.ts |
| `quotations` | components/QuotationAiImportSheet.tsx, hooks/useQuotationScenarios.ts, hooks/useQuotations.ts, pages/Index.tsx |
| `quote_design_elements` | hooks/useProposals.ts |
| `quote_experiences` | hooks/useQuotations.ts |
| `quote_templates` | hooks/useProposals.ts |
| `quote_transfers` | hooks/useQuotations.ts |
| `seat_blocks` | hooks/useSeatBlocks.ts |
| `subscription_plans` | hooks/useSubscriptionPlans.ts, pages/Analytics.tsx |
| `support_articles` | pages/HelpCenter.tsx, pages/admin/SupportAdmin.tsx |
| `support_tickets` | pages/HelpCenter.tsx, pages/admin/SupportAdmin.tsx |
| `system_logs` | shared/lib/logger.ts |
| `team_members` | hooks/useTeam.ts |
| `ticket_messages` | hooks/useTickets.ts |
| `tickets` | hooks/useTickets.ts, pages/Index.tsx |
| `traveler_info_pages` | hooks/useTravelerInfo.ts, pages/PublicTravelerInfo.tsx |
| `travelers` | components/crm/FichaClienteMaster.tsx, hooks/useTravelers.ts |
| `user_roles` | components/AuthProvider.tsx, hooks/useSettings.ts, pages/Onboarding.tsx |
| `vouchers` | hooks/useVouchers.ts |
| `wa_conversation_logs` | hooks/useWaExtension.ts |
| `wa_session_metrics` | hooks/useWaExtension.ts |
