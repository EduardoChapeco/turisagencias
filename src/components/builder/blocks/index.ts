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

// Register all blocks here
export function registerAllBlocks() {
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
}
