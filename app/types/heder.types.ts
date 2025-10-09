export interface HeaderProps {
  title: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
  showSearch?: boolean;
  showProfile?: boolean;
}

export interface HeaderIconProps {
  onPress: () => void;
  icon: string;
  testID?: string;
}