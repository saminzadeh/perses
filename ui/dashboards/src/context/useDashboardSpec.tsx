// Copyright 2022 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { DashboardSpec, GridDefinition } from '@perses-dev/core';
import { useRef, useEffect, useMemo } from 'react';
import { PanelGroupDefinition, useDashboardStore } from './DashboardProvider';
import { useTemplateVariableActions, useTemplateVariableDefinitions } from './TemplateVariableProvider';
export function useDashboardSpec() {
  const {
    panels,
    panelGroups,
    defaultTimeRange,
    reset: resetDashboardStore,
  } = useDashboardStore(({ panels, panelGroups, defaultTimeRange, reset }) => ({
    panels,
    panelGroups,
    defaultTimeRange,
    reset,
  }));
  const { setVariableDefinitions } = useTemplateVariableActions();
  const variables = useTemplateVariableDefinitions();
  const layouts = convertPanelGroupsToLayouts(panelGroups);

  const previousSpecRef = useRef<DashboardSpec | null>();

  const spec = useMemo(() => {
    return { panels, layouts, variables, duration: defaultTimeRange.pastDuration };
  }, [panels, layouts, variables, defaultTimeRange]);

  // Keep track of the last spec so that we can reset the dashboard
  useEffect(() => {
    previousSpecRef.current = spec;
  }, [spec]);

  const previousSpec = previousSpecRef.current;

  const reset = () => {
    if (previousSpec?.variables) {
      setVariableDefinitions(previousSpec?.variables);
    }
    resetDashboardStore();
  };

  return {
    reset,
    spec,
    previousSpec,
  };
}

function convertPanelGroupsToLayouts(panelGroups: Record<number, PanelGroupDefinition>): GridDefinition[] {
  const layouts: GridDefinition[] = [];
  Object.values(panelGroups).forEach((group) => {
    const { title, isCollapsed, items } = group;
    let display = undefined;
    if (title) {
      display = {
        title,
        collapse: {
          open: !isCollapsed,
        },
      };
    }
    const layout: GridDefinition = {
      kind: 'Grid',
      spec: {
        display,
        items,
      },
    };
    layouts.push(layout);
  });
  return layouts;
}
