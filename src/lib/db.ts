import { kv } from "@vercel/kv";
import { v4 as uuidv4 } from "uuid";

// Definindo a interface para um componente
export interface Component {
  id: string;
  name: string;
  stock: {
    available: number;
    defective: number;
  };
}

// Busca todos os componentes
export const getComponents = async (): Promise<Component[]> => {
  const components = await kv.get<Component[]>("components");
  return components || [];
};

// Adiciona um novo componente
// CORREÇÃO: Adicionamos 'defective' como parâmetro aqui
export const addComponent = async (name: string, available: number, defective: number): Promise<Component> => {
  const components = await getComponents();
  const newComponent: Component = {
    id: uuidv4(),
    name,
    stock: {
      available: parseInt(String(available), 10),
      defective: parseInt(String(defective), 10), // Usamos o novo campo
    },
  };
  await kv.set("components", [...components, newComponent]);
  return newComponent;
};

// Atualiza o estoque de um componente
export const updateStock = async (componentId: string, action: string): Promise<Component> => {
    const components = await getComponents();
    const componentIndex = components.findIndex(c => c.id === componentId);

    if (componentIndex === -1) throw new Error("Component not found");

    const component = components[componentIndex];

    switch (action) {
        case 'INCREMENT_AVAILABLE':
            component.stock.available++;
            break;
        case 'DECREMENT_AVAILABLE':
            if (component.stock.available > 0) component.stock.available--;
            break;
        case 'MARK_DEFECTIVE':
            if (component.stock.available > 0) {
                component.stock.available--;
                component.stock.defective++;
            }
            break;
        case 'MARK_REPAIRED':
            if (component.stock.defective > 0) {
                component.stock.defective--;
                component.stock.available++;
            }
            break;
        case 'DISCARD_DEFECTIVE':
             if (component.stock.defective > 0) component.stock.defective--;
            break;
        default:
            throw new Error("Invalid action");
    }

    components[componentIndex] = component;
    await kv.set("components", components);
    return component;
};


// Deleta um componente
export const deleteComponent = async (componentId: string): Promise<void> => {
  const components = await getComponents();
  const updatedComponents = components.filter(c => c.id !== componentId);
  await kv.set("components", updatedComponents);
};

// Adicione estas funções ao final do arquivo src/lib/db.ts

// Busca a lista de todos os administradores
export const getAdmins = async (): Promise<string[]> => {
  return await kv.smembers("admins");
};

// Adiciona um novo e-mail à lista de administradores
export const addAdmin = async (email: string): Promise<number> => {
  return await kv.sadd("admins", email);
};

// Remove um e-mail da lista de administradores
export const removeAdmin = async (email: string): Promise<number> => {
  // Medida de segurança: impede a remoção do admin principal definido no .env
  if (email === process.env.FIRST_ADMIN_EMAIL) {
    throw new Error("Cannot remove the primary administrator.");
  }
  return await kv.srem("admins", email);
};