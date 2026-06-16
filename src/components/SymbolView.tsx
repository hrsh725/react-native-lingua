import React from 'react';
import { View, Platform } from 'react-native';

let ExpoSymbolView: any = null;

// Only attempt to require expo-symbols on native platforms
if (Platform.OS !== 'web') {
  try {
    ExpoSymbolView = require('expo-symbols').SymbolView;
  } catch (e) {
    console.warn('expo-symbols not found, using fallback');
  }
}

export interface SymbolViewProps {
  name: string | { ios: string; android: string; web: string };
  size?: number;
  tintColor?: string;
  style?: any;
  [key: string]: any;
}

/**
 * Maps SF Symbol names to Material Icon names for Web/Android fallback.
 */
const mapSFSymbolToMaterial = (sfName: string): any => {
  const mapping: Record<string, any> = {
    'chevron.left': 'chevron-left',
    'bell': 'notifications',
    'video.fill': 'videocam',
    'video.slash.fill': 'videocam-off',
    'mic.fill': 'mic',
    'mic.slash.fill': 'mic-off',
    'phone.down.fill': 'call-end',
    'character.duallanguage': 'translate',
    'speaker.wave.3.fill': 'volume-up',
    'speaker.wave.2': 'volume-down',
    'house.fill': 'home',
    'house': 'home',
    'book.fill': 'menu-book',
    'book': 'book',
    'robot.fill': 'smart-toy',
    'robot': 'android',
    'bubble.left.fill': 'chat-bubble',
    'bubble.left': 'chat-bubble-outline',
    'person.fill': 'person',
    'person': 'person-outline',
    'checkmark': 'check',
    'lock': 'lock',
    'person.crop.circle.fill': 'account-circle',
    'cpu': 'memory',
  };
  return mapping[sfName] || 'help-outline';
};

export const SymbolView = (props: SymbolViewProps) => {
  const { name, size = 24, tintColor = '#000', style } = props;

  if (Platform.OS === 'web' || !ExpoSymbolView) {
    let iconName: any = 'help-outline';

    try {
      if (typeof name === 'string') {
        iconName = mapSFSymbolToMaterial(name);
      } else if (name && typeof name === 'object') {
        const webName = name.web || name.android;
        if (webName) {
          iconName = webName.replace(/_/g, '-');
        } else {
          iconName = mapSFSymbolToMaterial(name.ios);
        }
      }
    } catch (e) {}

    let MaterialIcons;
    try {
      MaterialIcons = require('@expo/vector-icons').MaterialIcons;
    } catch (e) {}

    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        {MaterialIcons ? (
          <MaterialIcons name={iconName} size={size} color={tintColor} />
        ) : (
          <View style={{ width: size, height: size, backgroundColor: tintColor, opacity: 0.3, borderRadius: size/2 }} />
        )}
      </View>
    );
  }

  return <ExpoSymbolView {...props} />;
};
