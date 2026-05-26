import React from 'react';
import { FileText } from 'lucide-react';

export const MediaDocumentViewerBlock = {
  type: 'media_document_viewer',
  category: 'media',
  label: 'Document Viewer',
  icon: FileText,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Document Viewer Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Document Viewer settings...
    </div>
  )
};
