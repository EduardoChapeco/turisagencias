import { useSearchParams, useNavigate } from 'react-router-dom';
import VisualBuilder from '@/components/builder/VisualBuilder';

export default function SiteBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = (searchParams.get('type') || 'website') as 'website' | 'linkbio' | 'blog';
  const id = searchParams.get('id');
  const nameParam = searchParams.get('name');

  const titleMap = {
    website: 'Website Principal',
    linkbio: 'Link na Bio / Biolink',
    blog: 'Blog de Viagens',
  };

  const projectName = nameParam || titleMap[type];

  return (
    <VisualBuilder 
      projectId={id}
      initialProjectType={type} 
      projectName={projectName} 
      onBack={() => navigate('/turisyou')}
    />
  );
}
