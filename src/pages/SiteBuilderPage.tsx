import { useSearchParams, useNavigate } from 'react-router-dom';
import VisualBuilder from '@/components/builder/VisualBuilder';

export default function SiteBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = (searchParams.get('type') || 'website') as 'website' | 'linkbio' | 'blog';

  const titleMap = {
    website: 'Website Principal',
    linkbio: 'Link na Bio / Biolink',
    blog: 'Blog de Viagens',
  };

  return (
    <VisualBuilder 
      initialProjectType={type} 
      projectName={titleMap[type]} 
      onBack={() => navigate('/')}
    />
  );
}
