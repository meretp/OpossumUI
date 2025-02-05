// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import { faker, test } from '../utils';

test.use({
  data: {
    decompress: true,
    inputData: faker.opossum.inputData(),
  },
});

test('allows user to keep outdated extension when user opens deprecated file', async ({
  fileSupportPopup,
  projectStatisticsPopup,
}) => {
  await fileSupportPopup.assert.titleIsVisible();
  await fileSupportPopup.keepOutdated();
  await fileSupportPopup.assert.titleIsHidden();
  await projectStatisticsPopup.assert.titleIsVisible();
});

test('allows user to switch to .opossum extension when user opens deprecated file', async ({
  fileSupportPopup,
  projectStatisticsPopup,
}) => {
  await fileSupportPopup.assert.titleIsVisible();
  await fileSupportPopup.convertToNew();
  await fileSupportPopup.assert.titleIsHidden();
  await projectStatisticsPopup.assert.titleIsVisible();
});
