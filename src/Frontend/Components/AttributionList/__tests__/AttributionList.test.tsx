// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, screen } from '@testing-library/react';

import {
  Attributions,
  Resources,
  ResourcesToAttributions,
} from '../../../../shared/shared-types';
import { ButtonText } from '../../../enums/enums';
import { loadFromFile } from '../../../state/actions/resource-actions/load-actions';
import {
  clickOnButtonInPackageContextMenu,
  expectButtonInPackageContextMenu,
  expectGlobalOnlyContextMenuForNotPreselectedAttribution,
  testCorrectMarkAndUnmarkForReplacementInContextMenu,
} from '../../../test-helpers/context-menu-test-helpers';
import { getParsedInputFileEnrichedWithTestData } from '../../../test-helpers/general-test-helpers';
import {
  createTestAppStore,
  EnhancedTestStore,
  renderComponentWithStore,
} from '../../../test-helpers/render-component-with-store';
import { DisplayPackageInfos } from '../../../types/types';
import { doNothing } from '../../../util/do-nothing';
import { AttributionList } from '../AttributionList';

function getTestStore(manualAttributions: Attributions): EnhancedTestStore {
  const store = createTestAppStore();
  store.dispatch(
    loadFromFile(
      getParsedInputFileEnrichedWithTestData({
        manualAttributions,
      }),
    ),
  );
  return store;
}

describe('The AttributionList', () => {
  const testSortedPackageCardIds = ['packageCardId'];
  const testDisplayPackageInfos: DisplayPackageInfos = {
    [testSortedPackageCardIds[0]]: {
      attributionConfidence: 0,
      comments: ['Some comment'],
      packageName: 'Test package',
      packageVersion: '1.0',
      copyright: 'Copyright John Doe',
      licenseText: 'Some license text',
      firstParty: true,
      attributionIds: ['uuid_1'],
    },
  };

  const attributions: Attributions = {
    uuid_1: {
      attributionConfidence: 0,
      comment: 'Some comment',
      packageName: 'Test package',
      packageVersion: '1.0',
      copyright: 'Copyright John Doe',
      licenseText: 'Some license text',
      firstParty: true,
    },
  };

  const mockCallback = jest.fn((attributionId: string) => {
    return attributionId;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    renderComponentWithStore(
      <AttributionList
        displayPackageInfos={testDisplayPackageInfos}
        sortedPackageCardIds={testSortedPackageCardIds}
        selectedPackageCardId={''}
        onCardClick={mockCallback}
        title={'title'}
      />,
      { store: getTestStore(attributions) },
    );
    expect(screen.getByText('Test package, 1.0'));
    expect(mockCallback.mock.calls.length).toBe(0);
  });

  it('renders first party icon', () => {
    renderComponentWithStore(
      <AttributionList
        displayPackageInfos={testDisplayPackageInfos}
        sortedPackageCardIds={testSortedPackageCardIds}
        selectedPackageCardId={''}
        onCardClick={doNothing}
        title={'title'}
      />,
      { store: getTestStore(attributions) },
    );
    expect(screen.getByText('Test package, 1.0'));
    expect(screen.getByLabelText('First party icon'));
  });

  it('sets selectedAttributionId on click', () => {
    renderComponentWithStore(
      <AttributionList
        displayPackageInfos={testDisplayPackageInfos}
        sortedPackageCardIds={testSortedPackageCardIds}
        selectedPackageCardId={''}
        onCardClick={mockCallback}
        title={'title'}
      />,
      { store: getTestStore(attributions) },
    );
    const attributionCard = screen.getByText('Test package, 1.0');
    expect(attributionCard).toBeInTheDocument();
    fireEvent.click(attributionCard);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe(testSortedPackageCardIds[0]);
  });

  it('shows correct replace attribution buttons in the context menu', () => {
    const testResources: Resources = {
      root: { src: { file_1: 1, file_2: 1 } },
      file: 1,
    };
    const testSortedPackageCardIds = [
      'packageCardId1',
      'packageCardId2',
      'packageCardId3',
    ];
    const testDisplayPackageInfos: DisplayPackageInfos = {
      [testSortedPackageCardIds[0]]: {
        packageName: 'jQuery',
        packageVersion: '16.0.0',
        comments: ['ManualPackage'],
        attributionIds: ['uuid_1'],
      },
      [testSortedPackageCardIds[1]]: {
        packageName: 'React',
        packageVersion: '16.0.0',
        comments: ['ManualPackage'],
        attributionIds: ['uuid_2'],
      },
      [testSortedPackageCardIds[2]]: {
        packageName: 'Vue',
        packageVersion: '16.0.0',
        comments: ['ManualPackage'],
        preSelected: true,
        attributionIds: ['uuid_3'],
      },
    };

    const testManualAttributions: Attributions = {
      uuid_1: {
        packageName: 'jQuery',
        packageVersion: '16.0.0',
        comment: 'ManualPackage',
      },
      uuid_2: {
        packageName: 'React',
        packageVersion: '16.0.0',
        comment: 'ManualPackage',
      },
      uuid_3: {
        packageName: 'Vue',
        packageVersion: '16.0.0',
        comment: 'ManualPackage',
        preSelected: true,
      },
    };
    const testResourcesToManualAttributions: ResourcesToAttributions = {
      '/root/src/file_1': ['uuid_1', 'uuid_2', 'uuid_3'],
      '/root/src/file_2': ['uuid_2'],
    };

    const testStore = createTestAppStore();
    testStore.dispatch(
      loadFromFile(
        getParsedInputFileEnrichedWithTestData({
          resources: testResources,
          manualAttributions: testManualAttributions,
          resourcesToManualAttributions: testResourcesToManualAttributions,
        }),
      ),
    );
    renderComponentWithStore(
      <AttributionList
        displayPackageInfos={testDisplayPackageInfos}
        sortedPackageCardIds={testSortedPackageCardIds}
        selectedPackageCardId={''}
        onCardClick={mockCallback}
        title={'title'}
      />,
      { store: testStore },
    );

    expectGlobalOnlyContextMenuForNotPreselectedAttribution(
      screen,
      'jQuery, 16.0.0',
    );

    testCorrectMarkAndUnmarkForReplacementInContextMenu(
      screen,
      'jQuery, 16.0.0',
    );

    clickOnButtonInPackageContextMenu(
      screen,
      'jQuery, 16.0.0',
      ButtonText.MarkForReplacement,
    );

    expectButtonInPackageContextMenu(
      screen,
      'Vue, 16.0.0',
      ButtonText.ReplaceMarked,
    );

    expectGlobalOnlyContextMenuForNotPreselectedAttribution(
      screen,
      'React, 16.0.0',
      true,
    );
  });
});
