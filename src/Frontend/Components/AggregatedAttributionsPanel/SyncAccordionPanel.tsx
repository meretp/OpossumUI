// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import { ReactElement } from 'react';

import {
  Attributions,
  AttributionsToHashes,
} from '../../../shared/shared-types';
import { PackagePanelTitle } from '../../enums/enums';
import { AttributionIdWithCount, PanelData } from '../../types/types';
import { getExternalDisplayPackageInfosWithCount } from './accordion-panel-helpers';
import { AccordionPanel } from './AccordionPanel';

interface SyncAccordionPanelProps {
  title: PackagePanelTitle;
  getAttributionIdsWithCount(): Array<AttributionIdWithCount>;
  attributionsToHashes: AttributionsToHashes;
  attributions: Attributions;
  isAddToPackageEnabled: boolean;
  ['aria-label']?: string;
}

export function SyncAccordionPanel(
  props: SyncAccordionPanelProps,
): ReactElement {
  const [sortedPackageCardIds, displayPackageInfosWithCount] =
    getExternalDisplayPackageInfosWithCount(
      props.getAttributionIdsWithCount(),
      props.attributions,
      props.attributionsToHashes,
      props.title,
    );
  const panelData: PanelData = {
    title: props.title,
    sortedPackageCardIds,
    displayPackageInfosWithCount,
  };

  return (
    <AccordionPanel
      panelData={panelData}
      isAddToPackageEnabled={props.isAddToPackageEnabled}
      aria-label={props['aria-label']}
    />
  );
}
