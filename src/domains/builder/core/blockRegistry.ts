import { BuilderBlockDefinition } from './blockContracts';

class Registry {
  private blocks: Map<string, BuilderBlockDefinition> = new Map();

  register(def: BuilderBlockDefinition) {
    if (this.blocks.has(def.type)) {
      console.warn(`Block type "${def.type}" is already registered. Overwriting.`);
    }
    this.blocks.set(def.type, def);
  }

  get(type: string): BuilderBlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getAll(): BuilderBlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getByCategory(category: string): BuilderBlockDefinition[] {
    return this.getAll().filter(b => b.category === category);
  }
}

export const BlockRegistry = new Registry();
