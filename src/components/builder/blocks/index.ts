import { BlockRegistry } from '../core/registry';
import { HeroBlock } from './HeroBlock';
import { FeaturesBlock } from './FeaturesBlock';
import { PricingBlock } from './PricingBlock';
import { GalleryBlock } from './GalleryBlock';
import { FaqBlock } from './FaqBlock';
import { CtaBlock } from './CtaBlock';
import { TestimonialsBlock } from './TestimonialsBlock';
import { StatsBlock } from './StatsBlock';
import { FormContainerBlock } from './FormContainerBlock';
import { CmsGridBlock } from './CmsGridBlock';

// Novos Micro-blocos
import { HeadingBlock } from './HeadingBlock';
import { ParagraphBlock } from './ParagraphBlock';
import { DividerBlock } from './DividerBlock';
import { SpacerBlock } from './SpacerBlock';
import { ColumnGridBlock } from './ColumnGridBlock';
import { ContainerBlock } from './ContainerBlock';

// Mídia
import { VideoPlayerBlock } from './VideoPlayerBlock';
import { ImageBlock } from './ImageBlock';
import { LogoTickerBlock } from './LogoTickerBlock';

// Macro Secões
import { StepsBlock } from './StepsBlock';
import { TeamBlock } from './TeamBlock';
import { TimelineBlock } from './TimelineBlock';
import { PricingCardsBlock } from './PricingCardsBlock';
import { HeaderBlock } from './HeaderBlock';
import { FooterBlock } from './FooterBlock';
import { NewsletterBlock } from './NewsletterBlock';

// Interativos
import { AccordionBlock } from './AccordionBlock';
import { AlertBlock } from './AlertBlock';

// Travel Blocks
import { TravelPackageGridBlock } from './TravelPackageGridBlock';
import { TravelItineraryTimelineBlock } from './TravelItineraryTimelineBlock';
import { TravelIncludedNotIncludedBlock } from './TravelIncludedNotIncludedBlock';
import { TravelHotelSummaryBlock } from './TravelHotelSummaryBlock';
import { TravelFlightSummaryBlock } from './TravelFlightSummaryBlock';
import { TravelRoomingPreviewBlock } from './TravelRoomingPreviewBlock';
import { TravelDocumentRequirementsBlock } from './TravelDocumentRequirementsBlock';
import { TravelMapRouteBlock } from './TravelMapRouteBlock';
import { TravelLastSpotsBlock } from './TravelLastSpotsBlock';
import { TravelDynamicPriceBadgeBlock } from './TravelDynamicPriceBadgeBlock';

// Hero Blocks
import { HeroCenteredMinimalBlock } from './HeroCenteredMinimalBlock';
import { HeroSplitImageBlock } from './HeroSplitImageBlock';
import { HeroVideoBackgroundBlock } from './HeroVideoBackgroundBlock';
import { HeroSearchBookingBlock } from './HeroSearchBookingBlock';
import { HeroGroupTripBlock } from './HeroGroupTripBlock';
import { HeroAgencyProfileBlock } from './HeroAgencyProfileBlock';
import { HeroLinkBioProfileBlock } from './HeroLinkBioProfileBlock';
import { HeroCountdownCampaignBlock } from './HeroCountdownCampaignBlock';
import { HeroDarkLuxuryBlock } from './HeroDarkLuxuryBlock';
import { HeroPortalEntryBlock } from './HeroPortalEntryBlock';

// Airline & LinkBio Blocks
import { AirlineCheckinButtonBlock } from './AirlineCheckinButtonBlock';
import { AirlineBoardingPassButtonBlock } from './AirlineBoardingPassButtonBlock';
import { AirlineManageBookingBlock } from './AirlineManageBookingBlock';
import { AirlineFlightStatusBlock } from './AirlineFlightStatusBlock';
import { AirlineCheckinStatusCardBlock } from './AirlineCheckinStatusCardBlock';
import { LinkBioButtonListBlock } from './LinkBioButtonListBlock';
import { LinkBioSocialIconsBlock } from './LinkBioSocialIconsBlock';
import { LinkBioWhatsappCardBlock } from './LinkBioWhatsappCardBlock';
import { BlogFeaturedPostBlock } from './BlogFeaturedPostBlock';
import { BlogPostGridBlock } from './BlogPostGridBlock';

// Form & CRM Blocks
import { FormContactBlock } from './FormContactBlock';
import { FormQuoteRequestBlock } from './FormQuoteRequestBlock';
import { FormWhatsappPrequalifierBlock } from './FormWhatsappPrequalifierBlock';
import { FormGroupTripSignupBlock } from './FormGroupTripSignupBlock';
import { FormWaitlistBlock } from './FormWaitlistBlock';
import { FormSupportTicketBlock } from './FormSupportTicketBlock';
import { FormNpsBlock } from './FormNpsBlock';
import { FormLeadQuizBlock } from './FormLeadQuizBlock';
import { CtaStickyBottomBlock } from './CtaStickyBottomBlock';
import { CtaFloatingWhatsappBlock } from './CtaFloatingWhatsappBlock';

// Layout & Sections
import { LayoutGrid2ColBlock } from './LayoutGrid2ColBlock';
import { LayoutGrid3ColBlock } from './LayoutGrid3ColBlock';
import { LayoutSidebarLeftBlock } from './LayoutSidebarLeftBlock';
import { LayoutSidebarRightBlock } from './LayoutSidebarRightBlock';
import { SectionHeroVideoBlock } from './SectionHeroVideoBlock';
import { SectionFeatureZigZagBlock } from './SectionFeatureZigZagBlock';
import { SectionPricingTableBlock } from './SectionPricingTableBlock';
import { SectionLogoCloudBlock } from './SectionLogoCloudBlock';
import { SectionCallToActionBlock } from './SectionCallToActionBlock';
import { SectionFaqAccordionBlock } from './SectionFaqAccordionBlock';
import { FeatureAdvancedGridBlock } from './FeatureAdvancedGridBlock';

// Galleries & Media
import { GalleryMasonryBlock } from './GalleryMasonryBlock';
import { GalleryBentoGridBlock } from './GalleryBentoGridBlock';
import { GalleryCarouselBlock } from './GalleryCarouselBlock';
import { GalleryInstagramFeedBlock } from './GalleryInstagramFeedBlock';
import { MediaTestimonialVideoBlock } from './MediaTestimonialVideoBlock';
import { MediaAudioPlayerBlock } from './MediaAudioPlayerBlock';
import { CarouselTestimonialsBlock } from './CarouselTestimonialsBlock';
import { CarouselLogosBlock } from './CarouselLogosBlock';
import { GalleryBeforeAfterBlock } from './GalleryBeforeAfterBlock';
import { MediaDocumentViewerBlock } from './MediaDocumentViewerBlock';
import { MediaInteractiveMapBlock } from './MediaInteractiveMapBlock';

// Commerce & Cards
import { CardProductBlock } from './CardProductBlock';
import { CardDestinationBlock } from './CardDestinationBlock';
import { CardTeamMemberBlock } from './CardTeamMemberBlock';
import { CardBlogArticleBlock } from './CardBlogArticleBlock';
import { GridProductListBlock } from './GridProductListBlock';
import { FinanceQuoteSummaryBlock } from './FinanceQuoteSummaryBlock';
import { FinanceInvoiceStatusBlock } from './FinanceInvoiceStatusBlock';
import { FinancePaymentButtonBlock } from './FinancePaymentButtonBlock';
import { CardReviewBlock } from './CardReviewBlock';
import { CardPromotionBlock } from './CardPromotionBlock';

// Register all blocks here
export function registerAllBlocks() {
 // Originais
 BlockRegistry.register(HeroBlock);
 BlockRegistry.register(FeaturesBlock);
 BlockRegistry.register(PricingBlock);
 BlockRegistry.register(GalleryBlock);
 BlockRegistry.register(FaqBlock);
 BlockRegistry.register(CtaBlock);
 BlockRegistry.register(TestimonialsBlock);
 BlockRegistry.register(StatsBlock);
 BlockRegistry.register(FormContainerBlock);
 BlockRegistry.register(CmsGridBlock);

 // Novos Micro-blocos
 BlockRegistry.register(HeadingBlock);
 BlockRegistry.register(ParagraphBlock);
 BlockRegistry.register(DividerBlock);
 BlockRegistry.register(SpacerBlock);
 BlockRegistry.register(ColumnGridBlock);
 BlockRegistry.register(ContainerBlock);

 // Mídia
 BlockRegistry.register(VideoPlayerBlock);
 BlockRegistry.register(ImageBlock);
 BlockRegistry.register(LogoTickerBlock);

 // Macro Secões
 BlockRegistry.register(StepsBlock);
 BlockRegistry.register(TeamBlock);
 BlockRegistry.register(TimelineBlock);
 BlockRegistry.register(PricingCardsBlock);
 BlockRegistry.register(HeaderBlock);
 BlockRegistry.register(FooterBlock);
 BlockRegistry.register(NewsletterBlock);

 // Interativos
 BlockRegistry.register(AccordionBlock);
 BlockRegistry.register(AlertBlock);

 // Travel Blocks
 BlockRegistry.register(TravelPackageGridBlock);
 BlockRegistry.register(TravelItineraryTimelineBlock);
 BlockRegistry.register(TravelIncludedNotIncludedBlock);
 BlockRegistry.register(TravelHotelSummaryBlock);
 BlockRegistry.register(TravelFlightSummaryBlock);
 BlockRegistry.register(TravelRoomingPreviewBlock);
 BlockRegistry.register(TravelDocumentRequirementsBlock);
 BlockRegistry.register(TravelMapRouteBlock);
 BlockRegistry.register(TravelLastSpotsBlock);
 BlockRegistry.register(TravelDynamicPriceBadgeBlock);

 // Hero Blocks
 BlockRegistry.register(HeroCenteredMinimalBlock);
 BlockRegistry.register(HeroSplitImageBlock);
 BlockRegistry.register(HeroVideoBackgroundBlock);
 BlockRegistry.register(HeroSearchBookingBlock);
 BlockRegistry.register(HeroGroupTripBlock);
 BlockRegistry.register(HeroAgencyProfileBlock);
 BlockRegistry.register(HeroLinkBioProfileBlock);
 BlockRegistry.register(HeroCountdownCampaignBlock);
 BlockRegistry.register(HeroDarkLuxuryBlock);
 BlockRegistry.register(HeroPortalEntryBlock);

 // Airline & LinkBio Blocks
 BlockRegistry.register(AirlineCheckinButtonBlock);
 BlockRegistry.register(AirlineBoardingPassButtonBlock);
 BlockRegistry.register(AirlineManageBookingBlock);
 BlockRegistry.register(AirlineFlightStatusBlock);
 BlockRegistry.register(AirlineCheckinStatusCardBlock);
 BlockRegistry.register(LinkBioButtonListBlock);
 BlockRegistry.register(LinkBioSocialIconsBlock);
 BlockRegistry.register(LinkBioWhatsappCardBlock);
 BlockRegistry.register(BlogFeaturedPostBlock);
 BlockRegistry.register(BlogPostGridBlock);

 // Form & CRM Blocks
 BlockRegistry.register(FormContactBlock);
 BlockRegistry.register(FormQuoteRequestBlock);
 BlockRegistry.register(FormWhatsappPrequalifierBlock);
 BlockRegistry.register(FormGroupTripSignupBlock);
 BlockRegistry.register(FormWaitlistBlock);
 BlockRegistry.register(FormSupportTicketBlock);
 BlockRegistry.register(FormNpsBlock);
 BlockRegistry.register(FormLeadQuizBlock);
 BlockRegistry.register(CtaStickyBottomBlock);
 BlockRegistry.register(CtaFloatingWhatsappBlock);

 // Layout & Sections
 BlockRegistry.register(LayoutGrid2ColBlock);
 BlockRegistry.register(LayoutGrid3ColBlock);
 BlockRegistry.register(LayoutSidebarLeftBlock);
 BlockRegistry.register(LayoutSidebarRightBlock);
 BlockRegistry.register(SectionHeroVideoBlock);
 BlockRegistry.register(SectionFeatureZigZagBlock);
 BlockRegistry.register(SectionPricingTableBlock);
 BlockRegistry.register(SectionLogoCloudBlock);
 BlockRegistry.register(SectionCallToActionBlock);
 BlockRegistry.register(SectionFaqAccordionBlock);
 BlockRegistry.register(FeatureAdvancedGridBlock);

 // Galleries & Media
 BlockRegistry.register(GalleryMasonryBlock);
 BlockRegistry.register(GalleryBentoGridBlock);
 BlockRegistry.register(GalleryCarouselBlock);
 BlockRegistry.register(GalleryInstagramFeedBlock);
 BlockRegistry.register(MediaTestimonialVideoBlock);
 BlockRegistry.register(MediaAudioPlayerBlock);
 BlockRegistry.register(CarouselTestimonialsBlock);
 BlockRegistry.register(CarouselLogosBlock);
 BlockRegistry.register(GalleryBeforeAfterBlock);
 BlockRegistry.register(MediaDocumentViewerBlock);
 BlockRegistry.register(MediaInteractiveMapBlock);

 // Commerce & Cards
 BlockRegistry.register(CardProductBlock);
 BlockRegistry.register(CardDestinationBlock);
 BlockRegistry.register(CardTeamMemberBlock);
 BlockRegistry.register(CardBlogArticleBlock);
 BlockRegistry.register(GridProductListBlock);
 BlockRegistry.register(FinanceQuoteSummaryBlock);
 BlockRegistry.register(FinanceInvoiceStatusBlock);
 BlockRegistry.register(FinancePaymentButtonBlock);
 BlockRegistry.register(CardReviewBlock);
 BlockRegistry.register(CardPromotionBlock);
}
