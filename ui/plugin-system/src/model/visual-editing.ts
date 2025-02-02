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

import { JsonObject } from '@perses-dev/core';
import React from 'react';

/**
 * A component for visual editing of a plugin's options.
 */
export type OptionsEditor<Options extends JsonObject = JsonObject> = React.ComponentType<OptionsEditorProps<Options>>;

/**
 * Common props passed to options editor components.
 */
export interface OptionsEditorProps<Options extends JsonObject = JsonObject> {
  // TODO: These are temporary and may not actually make sense, so replace
  // with whatever makes sense as visual editing evolves
  value: Options;
  onChange: (next: Options) => void;
}

/**
 * Callback for creating initial/empty options for a plugin.
 */
export type InitialOptionsCallback<Options extends JsonObject> = () => Options;
