import * as React from 'react';
import {
  Text as DefaultText,
  View as DefaultView,
  TouchableOpacity as DefaultButton,
  TextInput as DefaultTextInput,
  Image as DefaultImage
} from 'react-native';
import SvgUri from "expo-svg-uri"
import Colors from '~constants/Colors'
import useColorScheme from '~hooks/useColorScheme'
import tw from 'tailwind-rn'

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ButtonProps = ThemeProps & DefaultButton['props'];
export type TextInputProps = ThemeProps & DefaultTextInput['props'];
export type ImageProps = ThemeProps & DefaultImage['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Button(props: ButtonProps) {
  const { style, styleTitle, lightColor, darkColor, icon, iconPosition, title, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const defaultButtonStyle = tw('flex flex-row items-center px-6 py-3 rounded-full')
  const defaultTextStyle = tw('text-white')

  return <DefaultButton style={[{ backgroundColor }, defaultButtonStyle, style]} {...otherProps}>
    {iconPosition !== 'right' && icon}
    {title && <Text style={[defaultTextStyle, styleTitle]}>{title}</Text>}
    {iconPosition === 'right' && icon}
  </DefaultButton>;
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultTextInput style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Image(props: ImageProps) {
  const { source, svgProps = null, style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return !svgProps ?
    <DefaultImage
      source={source}
      style={style}
      {...otherProps}
    />
    :
    <SvgUri
      source={source}
      style={style}
      {...svgProps}
    />
}
