import AppleSpinner from '../components/AppleSpinner';
import Screen from '../components/Screen';

export default function LoadingScreen({ isActive, text }) {
  return (
    <Screen active={isActive}>
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AppleSpinner />
        <p className="text-sm font-medium text-mova-text-secondary">{text}</p>
      </div>
    </Screen>
  );
}
