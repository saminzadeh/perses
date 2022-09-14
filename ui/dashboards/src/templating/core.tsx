import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { TemplateVariableContext } from '@perses-dev/plugin-system';
import {
  VariableDefinitions,
  VariablesState,
  VariableState,
  VariableName,
  VariableValue,
  ListVariableDefinition,
  VariableDefinition,
} from '@perses-dev/core';

const ALL_VALUE = '$__all';

type TemplateVariableSrv = {
  variableDefinitions: VariableDefinitions;
  variableState: VariablesState;
  setVariableValue: (variableName: VariableName, value: VariableValue) => void;
  loadTemplateVariable: (name: VariableName) => Promise<void>;
};

const TemplateVariableSrvContext = createContext<ReturnType<typeof createTemplateVariableSrvStore> | undefined>(
  undefined
);
function useTemplateVariableSrvContext() {
  const context = useContext(TemplateVariableSrvContext);
  if (!context) {
    throw new Error('TemplateVariableSrvContext not initialized');
  }
  return context;
}

export function useTemplateVariableValues(variableNames?: string[]) {
  const store = useTemplateVariableSrvContext();
  const state = useStore(
    store,
    (s) => {
      const names = variableNames ?? Object.keys(s.variableState);
      const vars: VariablesState = {};
      names.forEach((name) => {
        const varState = s.variableState[name];
        if (!varState) {
          return;
        }
        vars[name] = varState;
      });
      return vars;
    },
    (left, right) => {
      return JSON.stringify(left) === JSON.stringify(right);
    }
  );
  return state;
}

export function useTemplateVariable(name: string) {
  const store = useTemplateVariableSrvContext();
  return useStore(store, (s) => {
    const variableState = s.variableState[name];
    const definition = s.variableDefinitions.find((v) => v.name === name);
    return {
      state: variableState,
      definition,
    };
  });
}

export function useTemplateVariableActions() {
  const store = useTemplateVariableSrvContext();
  return useStore(store, (s) => {
    return {
      setVariableValue: s.setVariableValue,
      loadTemplateVariable: s.loadTemplateVariable,
    };
  });
}

export function useTemplateVariableDefintions() {
  const store = useTemplateVariableSrvContext();
  return useStore(store, (s) => s.variableDefinitions);
}

export function useTemplateVariableSrv() {
  const store = useTemplateVariableSrvContext();
  return useStore(store);
}

function PluginProvider({ children }: { children: React.ReactNode }) {
  const values = useTemplateVariableValues();
  return <TemplateVariableContext.Provider value={{ state: values }}>{children}</TemplateVariableContext.Provider>;
}

interface TemplateVariableSrvArgs {
  initialVariableDefinitions?: VariableDefinitions;
}

function createTemplateVariableSrvStore({ initialVariableDefinitions = [] }: TemplateVariableSrvArgs) {
  const store = createStore<TemplateVariableSrv>()(
    devtools(
      immer((set, get) => ({
        variableState: hydrateTemplateVariableStates(initialVariableDefinitions),
        variableDefinitions: initialVariableDefinitions,

        // Actions
        loadTemplateVariable: async (name: VariableName) => {
          const def = get().variableDefinitions.find((v) => v.name === name) as ListVariableDefinition;
          if (!def) {
            // Can't find the variable definition
            return;
          }

          set((state) => {
            const varState = state.variableState[name];
            if (varState) {
              varState.loading = true;
            }
          });

          // Replace with loader
          const { data: values } = await loadTemplateVariables();

          if (def.options.allowAllValue) {
            values.unshift(getAllOption());
          }
          set((state) => {
            const varState = state.variableState[name];
            if (varState) {
              varState.options = values;
              varState.loading = false;
            }
          });
          return;
        },

        setVariableValue: (name, value) =>
          set((state) => {
            let val = value;
            const varState = state.variableState[name];
            if (!varState) {
              return;
            }

            // Make sure there is only one all value
            if (Array.isArray(val) && val.includes(ALL_VALUE)) {
              if (val.at(-1) === ALL_VALUE) {
                val = [ALL_VALUE];
              } else {
                val = val.filter((v) => v !== ALL_VALUE);
              }
            }
            varState.value = val;
          }),
      }))
    )
  );

  return store;
}

export function TemplateVariableProvider({
  children,
  initialVariableDefinitions = [],
}: {
  children: React.ReactNode;
  initialVariableDefinitions?: VariableDefinitions;
}) {
  const store = createTemplateVariableSrvStore({ initialVariableDefinitions });

  return (
    <TemplateVariableSrvContext.Provider value={store}>
      <PluginProvider>{children}</PluginProvider>
    </TemplateVariableSrvContext.Provider>
  );
}

/** Helpers */
async function loadTemplateVariables() {
  // @TODO: Replace with plugin call
  // simluate sleep for 2 seconds
  // random time between 1 and 3 seconds

  const sleepTime = Math.floor(Math.random() * 10000) + 1000;
  await new Promise((resolve) => setTimeout(resolve, sleepTime));
  return {
    data: [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ].map((v) => ({ label: v, value: v })),
  };
}

function getAllOption() {
  return { label: 'All', value: ALL_VALUE };
}

function hydrateTemplateVariableState(definition: VariableDefinition) {
  const v = definition;
  const varState: VariableState = {
    name: v.name,
    value: null,
    loading: false,
    error: null,
  };
  switch (v.kind) {
    case 'TextVariable':
      varState.value = v.options.value;
      break;
    case 'ListVariable':
      varState.options = [];
      if (v.options.allowAllValue) {
        varState.options.unshift({ label: 'All', value: ALL_VALUE });
      }
      if (varState.options.length > 0 && !varState.value) {
        const firstOptionValue = varState.options[0]?.value ?? null;
        if (firstOptionValue !== null) {
          varState.value = v.options.allowMultiple ? [firstOptionValue] : firstOptionValue;
        }
      }
    default:
      break;
  }
  return varState;
}

function hydrateTemplateVariableStates(definitions: VariableDefinitions): VariablesState {
  const state: VariablesState = {};
  definitions.forEach((v) => {
    state[v.name] = hydrateTemplateVariableState(v);
  });
  return state;
}