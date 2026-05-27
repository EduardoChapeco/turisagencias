import { BlockDef } from './types';

class Registry {
 private blocks: Map<string, BlockDef> = new Map();

 register(def: BlockDef) {
 if (this.blocks.has(def.type)) {
 console.warn(`Block type "${def.type}" is already registered. Overwriting.`);
 }
 this.blocks.set(def.type, def);
 }

 get(type: string): BlockDef | undefined {
 return this.blocks.get(type);
 }

 getAll(): BlockDef[] {
 return Array.from(this.blocks.values());
 }

 getByCategory(category: string): BlockDef[] {
 return this.getAll().filter(b => b.category === category);
 }
}

export const BlockRegistry = new Registry();
