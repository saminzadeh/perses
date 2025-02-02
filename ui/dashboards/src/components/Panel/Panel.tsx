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

import { useState, useMemo } from 'react';
import useResizeObserver from 'use-resize-observer';
import { useInView } from 'react-intersection-observer';
import { PluginBoundary } from '@perses-dev/plugin-system';
import { ErrorAlert, InfoTooltip, TooltipPlacement } from '@perses-dev/components';
import { PanelDefinition } from '@perses-dev/core';
import {
  Box,
  Card,
  CardProps,
  CardHeader,
  CardContent,
  Typography,
  IconButton as MuiIconButton,
  Stack,
  styled,
} from '@mui/material';
import InformationOutlineIcon from 'mdi-material-ui/InformationOutline';
import PencilIcon from 'mdi-material-ui/Pencil';
import MenuIcon from 'mdi-material-ui/DotsVertical';
import DragIcon from 'mdi-material-ui/Drag';
import { useEditMode } from '../../context';
import { PanelContent } from './PanelContent';

export interface PanelProps extends CardProps {
  definition: PanelDefinition;
}

/**
 * Renders a PanelDefinition's content inside of a Card.
 */
export function Panel(props: PanelProps) {
  const { definition, ...others } = props;
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);

  const { width, height } = useResizeObserver({ ref: contentElement });

  const contentDimensions = useMemo(() => {
    if (width === undefined || height === undefined) return undefined;
    return { width, height };
  }, [width, height]);

  const { ref, inView } = useInView({
    threshold: 0.3,
    initialInView: false,
    triggerOnce: true,
  });

  // TODO: adjust padding for small panels, consistent way to determine isLargePanel here and in StatChart
  const panelPadding = 1.5;

  const { isEditMode } = useEditMode();

  return (
    <Card
      ref={ref}
      sx={{
        ...others.sx,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexFlow: 'column nowrap',
      }}
      variant="outlined"
      {...others}
    >
      <CardHeader
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: '24px',
            }}
          >
            <Typography
              component="h2"
              variant="body2"
              fontWeight={(theme) => theme.typography.fontWeightMedium}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {definition.display.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              {!isEditMode && definition.display.description && (
                <InfoTooltip
                  id="info-tooltip"
                  description={definition.display.description}
                  placement={TooltipPlacement.Bottom}
                >
                  <InformationOutlineIcon
                    aria-describedby="info-tooltip"
                    aria-hidden={false}
                    fontSize="small"
                    sx={{ cursor: 'pointer' }}
                  />
                </InfoTooltip>
              )}
              {isEditMode && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton aria-label="drag handle" size="small">
                    <DragIcon className="drag-handle" sx={{ cursor: 'grab' }} />
                  </IconButton>
                  <IconButton aria-label="edit panel" size="small">
                    <PencilIcon />
                  </IconButton>
                  <IconButton aria-label="more" size="small">
                    <MenuIcon />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Box>
        }
        sx={{
          display: 'block',
          padding: (theme) => theme.spacing(1, panelPadding),
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      />
      <CardContent
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flexGrow: 1,
          padding: (theme) => theme.spacing(panelPadding),
          // Override MUI default style for last-child
          ':last-child': {
            padding: (theme) => theme.spacing(panelPadding),
          },
        }}
        ref={setContentElement}
      >
        <PluginBoundary loadingFallback="Loading..." ErrorFallbackComponent={ErrorAlert}>
          {inView === true && <PanelContent definition={definition} contentDimensions={contentDimensions} />}
        </PluginBoundary>
      </CardContent>
    </Card>
  );
}

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: '4px',
}));
