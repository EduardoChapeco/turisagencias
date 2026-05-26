import React from 'react';
import { BlockDef } from '../core/types';
import { PlaneTakeoff, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const TravelFlightSummaryBlock: BlockDef = {
  type: 'travel-flight-summary',
  label: 'Flight Summary',
  category: 'travel',
  icon: PlaneTakeoff,
  
  defaultProps: {
    title: 'Flight Details',
    airline: 'Airways International',
    flightNumber: 'AW 102',
    departureAirport: 'GRU',
    departureTime: '10:30 AM',
    departureDate: '10 Oct 2026',
    arrivalAirport: 'JFK',
    arrivalTime: '07:15 PM',
    arrivalDate: '10 Oct 2026',
    duration: '8h 45m',
    type: 'Non-stop'
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-slate-50',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { title, airline, flightNumber, departureAirport, departureTime, departureDate, arrivalAirport, arrivalTime, arrivalDate, duration, type } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-4xl mx-auto">
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h2"
            className="text-2xl font-black mb-6"
          />
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <PlaneTakeoff className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="font-bold">{airline}</div>
                  <div className="text-xs text-slate-500">{flightNumber}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold bg-slate-100 px-3 py-1 rounded-full">{type}</div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6 border-y border-slate-100">
              <div className="text-center md:text-left flex-1">
                <div className="text-4xl font-black text-slate-800 mb-1">{departureAirport}</div>
                <div className="text-xl font-bold">{departureTime}</div>
                <div className="text-sm text-slate-500">{departureDate}</div>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-4 w-full md:w-auto">
                <div className="text-xs text-slate-400 font-medium mb-2">{duration}</div>
                <div className="w-full flex items-center gap-2">
                  <div className="h-[2px] bg-slate-200 flex-1"></div>
                  <PlaneTakeoff className="text-slate-400 w-5 h-5" />
                  <div className="h-[2px] bg-slate-200 flex-1"></div>
                </div>
              </div>

              <div className="text-center md:text-right flex-1">
                <div className="text-4xl font-black text-slate-800 mb-1">{arrivalAirport}</div>
                <div className="text-xl font-bold">{arrivalTime}</div>
                <div className="text-sm text-slate-500">{arrivalDate}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
          <Input 
            value={node.props.title || ''} 
            onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Companhia Aérea</Label>
          <Input 
            value={node.props.airline || ''} 
            onChange={e => onChange({ props: { ...node.props, airline: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
