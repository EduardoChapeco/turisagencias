import React from 'react';
import { MessageCircleQuestion } from 'lucide-react';

export const SectionFaqAccordionBlock = {
 type: 'section_faq_accordion',
 category: 'layout',
 label: 'FAQ Accordion',
 icon: MessageCircleQuestion,
 renderComponent: (props: any) => {
 return (
 <div className="w-full py-16 px-4 max-w-3xl mx-auto">
 <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
 <div className="space-y-4">
 {[1, 2, 3].map((item) => (
 <div key={item} className="border border-gray-200 rounded-lg p-4">
 <div className="flex justify-between items-center cursor-pointer">
 <h3 className="font-semibold">Question {item} example text?</h3>
 <span className="text-gray-400">▼</span>
 </div>
 {item === 1 && (
 <div className="mt-4 text-gray-600 text-sm">
 This is the answer to the first question. It explains details clearly.
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 );
 },
 settingsComponent: (props: any) => {
 return (
 <div className="p-4 space-y-4">
 <div className="text-sm font-medium">FAQ Accordion Settings</div>
 <div className="text-sm text-gray-500">Add, edit, or remove FAQ items.</div>
 </div>
 );
 }
};
