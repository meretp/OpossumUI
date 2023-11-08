// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, screen } from '@testing-library/react';

import {
  DiscreteConfidence,
  ParsedFileContent,
} from '../../../../shared/shared-types';
import { text } from '../../../../shared/text';
import { App } from '../../../Components/App/App';
import { ButtonText, View } from '../../../enums/enums';
import {
  expectValueInTextBox,
  insertValueIntoTextBox,
} from '../../../test-helpers/attribution-column-test-helpers';
import {
  clickOnButton,
  clickOnEditIconForElement,
  clickOnOpenFileIcon,
  closeProjectStatisticsPopup,
  EMPTY_PARSED_FILE_CONTENT,
  expectNoAttributionIsMarkedAsWasPreferred,
  goToView,
  mockElectronBackendOpenFile,
} from '../../../test-helpers/general-test-helpers';
import {
  expectEditAttributionPopupIsNotShown,
  expectEditAttributionPopupIsShown,
  expectModifyWasPreferredPopupIsShown,
  expectUnsavedChangesPopupIsShown,
} from '../../../test-helpers/popup-test-helpers';
import { renderComponentWithStore } from '../../../test-helpers/render-component-with-store';
import {
  clickOnElementInResourceBrowser,
  expectResourceBrowserIsNotShown,
} from '../../../test-helpers/resource-browser-test-helpers';

describe('The report view', () => {
  it('opens a EditAttributionPopup by clicking on edit and saves changes', () => {
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: {
        directory_manual: { subdirectory_manual: { file_manual: 1 } },
      },
      manualAttributions: {
        attributions: {
          uuid_1: {
            attributionConfidence: DiscreteConfidence.High,
            packageName: 'jQuery',
            licenseText: 'MIT',
          },
        },
        resourcesToAttributions: {
          '/directory_manual/subdirectory_manual/': ['uuid_1'],
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);

    clickOnOpenFileIcon(screen);
    goToView(screen, View.Report);
    expectResourceBrowserIsNotShown(screen);

    screen.getByText('Name');
    screen.getByText('License');
    screen.getByText('License Text');
    screen.getByText('Resources');
    expect(screen.getAllByText('Name').length).toBe(1);

    screen.getByText('jQuery');
    screen.getByText('MIT');
    screen.getByText('/directory_manual/subdirectory_manual/');
    screen.getByText(`${DiscreteConfidence.High}`);

    clickOnEditIconForElement(screen, 'jQuery');
    expectEditAttributionPopupIsShown(screen);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expectValueInTextBox(
      screen,
      'License Text (to appear in attribution document)',
      'MIT',
    );
    insertValueIntoTextBox(screen, 'Comment', 'Test comment');
    clickOnButton(screen, ButtonText.Save);
    expectEditAttributionPopupIsNotShown(screen);
    expect(screen.getByText('Test comment'));
  });

  it('recognizes frequent licenses and shows full license text in report view', () => {
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: { 'something.js': 1 },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'React',
            packageVersion: '16.5.0',
            licenseText: '',
          },
        },
        resourcesToAttributions: {
          '/something.js': ['uuid_1'],
        },
      },
      frequentLicenses: {
        nameOrder: [
          { shortName: 'GPL-2.0', fullName: 'General Public License 2.0' },
          {
            shortName: 'Apache',
            fullName: 'Apache license',
          },
        ],
        texts: {
          'GPL-2.0': 'frequent license',
          Apache: 'Apache license text',
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);
    closeProjectStatisticsPopup(screen);

    clickOnElementInResourceBrowser(screen, 'something.js');

    insertValueIntoTextBox(screen, 'License Name', 'gpl-2.0');
    clickOnButton(screen, ButtonText.Save);

    goToView(screen, View.Report);
    screen.getByText('gpl-2.0');
    // @ts-ignore
    expect(screen.queryByText('frequent license')).not.toBeInTheDocument();

    goToView(screen, View.Audit);
    insertValueIntoTextBox(screen, 'License Name', 'GPL-2.0');

    clickOnButton(screen, ButtonText.Save);
    goToView(screen, View.Report);
    screen.getByText('GPL-2.0');
    screen.getByText('frequent license');

    goToView(screen, View.Audit);
    insertValueIntoTextBox(screen, 'License Name', 'Apac');
    fireEvent.click(screen.getByText('Apache - Apache license'));
    clickOnButton(screen, ButtonText.Save);
    goToView(screen, View.Report);
    screen.getByText('Apache');
    screen.getByText('Apache license text');
  });

  it('removes was-preferred field when user has saved unsaved changes and navigates away', () => {
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: { 'something.js': 1 },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'React',
            packageVersion: '16.5.0',
            licenseText: 'Permission is hereby granted',
            wasPreferred: true,
          },
        },
        resourcesToAttributions: {
          '/something.js': ['uuid_1'],
        },
      },
    };

    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);

    goToView(screen, View.Report);
    clickOnEditIconForElement(screen, 'React');
    expectEditAttributionPopupIsShown(screen);
    insertValueIntoTextBox(screen, 'Comment', 'Test comment');
    clickOnButton(screen, ButtonText.Cancel);
    expectUnsavedChangesPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Save);
    expectModifyWasPreferredPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Cancel);
    expectEditAttributionPopupIsShown(screen);

    expect(window.electronAPI.saveFile).toHaveBeenCalledTimes(0);
    expectValueInTextBox(screen, 'Comment', 'Test comment');

    clickOnButton(screen, ButtonText.Save);
    expectModifyWasPreferredPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Save);
    expectEditAttributionPopupIsNotShown(screen);

    goToView(screen, View.Attribution);
    expectNoAttributionIsMarkedAsWasPreferred(screen);
  });
});
