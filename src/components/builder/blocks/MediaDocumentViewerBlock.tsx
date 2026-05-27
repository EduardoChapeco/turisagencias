import React from 'react';
import { FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const MediaDocumentViewerBlock = {
 type: 'media_document_viewer',
 category: 'media',
 label: 'Document Viewer',
 icon: FileText,
 defaultProps: {
 documentUrl: '',
 title: 'Roteiro em PDF'
 },
 defaultStyles: {
 padding: '24px 0',
 backgroundColor: 'transparent'
 },
 renderComponent: ({ node }) => {
 const { documentUrl = '', title = '' } = node.props || {};

 return (
 <div style={node.styles} className="w-full flex justify-center">
 {!documentUrl ? (
 <div className="p-8 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center w-full max-w-4xl min-h-[400px]">
 <div className="text-center text-gray-500">
 <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
 <p>Cole a URL do PDF (Google Drive, Supabase Storage, etc)</p>
 </div>
 </div>
 ) : (
 <div className="w-full max-w-4xl h-[600px] rounded-xl overflow-hidden border border-gray-200 bg-white relative flex flex-col">
 <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
 <span className="font-medium text-gray-700 text-sm">{title}</span>
 <a href={documentUrl} target="_blank" rel="noreferrer" className="text-vj-green hover:underline text-xs font-bold">Abrir em nova aba</a>
 </div>
 <iframe 
 src={documentUrl.endsWith('.pdf') ? documentUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
 title={title || "Document viewer"} 
 className="w-full flex-1"
 />
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="p-4 space-y-4">
 <div className="space-y-2">
 <Label>URL do Documento (PDF/DOC)</Label>
 <Input 
 value={node.props?.documentUrl || ''}
 onChange={(e) => onChange({ props: { ...node.props, documentUrl: e.target.value } })}
 placeholder="https://meusite.com/roteiro.pdf"
 />
 </div>
 <div className="space-y-2">
 <Label>Título do Documento</Label>
 <Input 
 value={node.props?.title || ''}
 onChange={(e) => onChange({ props: { ...node.props, title: e.target.value } })}
 placeholder="Ex: Roteiro 7 Dias Paris"
 />
 </div>
 </div>
 );
 }
};
