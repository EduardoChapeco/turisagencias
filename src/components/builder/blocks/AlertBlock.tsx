import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';

export const AlertBlock: BlockDef = {
 type: 'AlertBlock',
 label: 'Alert Banner',
 category: 'typography',
 icon: AlertCircle,
 defaultProps: {
 variant: 'info', // 'info', 'success', 'warning', 'error'
 title: 'Update Available',
 message: 'A new version of this software is ready to download. Please update to enjoy the latest features.',
 },
 defaultStyles: {
 padding: '1rem 2rem',
 backgroundColor: 'transparent',
 },
 renderComponent: ({ node }) => {
 const { variant, title, message } = node.props;

 const variants = {
 info: {
 bg: 'bg-blue-50',
 border: 'border-blue-200',
 text: 'text-blue-800',
 iconColor: 'text-blue-500',
 icon: Info,
 },
 success: {
 bg: 'bg-emerald-50',
 border: 'border-emerald-200',
 text: 'text-emerald-800',
 iconColor: 'text-emerald-500',
 icon: CheckCircle2,
 },
 warning: {
 bg: 'bg-amber-50',
 border: 'border-amber-200',
 text: 'text-amber-800',
 iconColor: 'text-amber-500',
 icon: AlertTriangle,
 },
 error: {
 bg: 'bg-red-50',
 border: 'border-red-200',
 text: 'text-red-800',
 iconColor: 'text-red-500',
 icon: XCircle,
 },
 };

 const currentVariant = variants[variant as keyof typeof variants] || variants.info;
 const Icon = currentVariant.icon;

 return (
 <div className={`max-w-4xl mx-auto rounded-xl border p-4 flex items-start gap-4 ${currentVariant.bg} ${currentVariant.border}`}>
 <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${currentVariant.iconColor}`} />
 <div className="flex-1">
 <EditableText
 value={title}
 onChange={(val) => onChange({ props: { ...node.props, title: val } })}
 className={`font-semibold mb-1 ${currentVariant.text}`}
 />
 <EditableText
 value={message}
 onChange={(val) => onChange({ props: { ...node.props, message: val } })}
 className={`text-sm opacity-90 ${currentVariant.text}`}
 />
 </div>
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label>Alert Type</Label>
 <select
 className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
 value={node.props.variant}
 onChange={(e) => onChange({ props: { ...node.props, variant: e.target.value } })}
 >
 <option value="info">Info (Blue)</option>
 <option value="success">Success (Green)</option>
 <option value="warning">Warning (Yellow)</option>
 <option value="error">Error (Red)</option>
 </select>
 </div>
 </div>
 );
 },
};
