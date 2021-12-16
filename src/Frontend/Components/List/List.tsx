// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { CSSProperties, ReactElement } from 'react';
import { FixedSizeList as VirtualizedList } from 'react-window';
import { Height, NumberOfDisplayedItems } from '../../types/types';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';

const useStyles = makeStyles({
  paddingBottomScrollbar: {
    paddingBottom: 18,
  },
  scrollChild: {
    direction: 'ltr',
  },
});

interface ListProps {
  length: number;
  max: NumberOfDisplayedItems | Height;
  getListItem(index: number): ReactElement | null;
  cardVerticalDistance?: number;
  alwaysShowHorizontalScrollBar?: boolean;
  addPaddingBottom?: boolean;
  allowHorizontalScrolling?: boolean;
  leftScrollBar?: boolean;
  className?: string;
}

function maxHeightWasGiven(
  max: NumberOfDisplayedItems | Height
): max is Height {
  return Boolean((max as Height).height);
}

export function List(props: ListProps): ReactElement {
  const classes = useStyles();
  const cardHeight = props.cardVerticalDistance || 24;
  const maxHeight = maxHeightWasGiven(props.max)
    ? props.max.height
    : props.max.numberOfDisplayedItems * cardHeight;
  const currentHeight = props.length * cardHeight;
  const listHeight = props.alwaysShowHorizontalScrollBar
    ? maxHeight
    : Math.min(currentHeight, maxHeight);

  return (
    <div className={props.className} style={{ maxHeight: currentHeight }}>
      <VirtualizedList
        height={listHeight}
        width={'vertical'}
        itemSize={cardHeight}
        itemCount={props.length}
        className={clsx(
          props.addPaddingBottom ? classes.paddingBottomScrollbar : null
        )}
        style={{
          direction: `${props.leftScrollBar ? 'rtl' : 'ltr'}`,
          overflow: `${
            props.alwaysShowHorizontalScrollBar ? 'scroll' : 'auto'
          } ${currentHeight < maxHeight ? 'hidden' : 'auto'}`,
        }}
      >
        {({
          index,
          style,
        }: {
          index: number;
          style: CSSProperties;
        }): ReactElement => (
          <div
            className={clsx(props.leftScrollBar && classes.scrollChild)}
            style={
              props.allowHorizontalScrolling
                ? {
                    ...style,
                    minWidth: '100%',
                    width: 'fit-content',
                  }
                : style
            }
          >
            {props.getListItem(index)}
          </div>
        )}
      </VirtualizedList>
    </div>
  );
}
