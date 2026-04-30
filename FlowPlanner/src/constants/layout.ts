import { Platform } from 'react-native';

export const TAB_BAR_HEIGHT = 60;

export const getScreenPadding = (bottomInset: number) => ({
  paddingBottom: bottomInset + TAB_BAR_HEIGHT + 8,
});