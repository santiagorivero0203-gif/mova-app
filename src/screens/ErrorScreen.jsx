import { ErrorIcon } from '../components/icons';
import Screen from '../components/Screen';
import { es } from '../i18n/es';

export default function ErrorScreen({ isActive, errorMessage, onRetry, onBack }) {
  return (
    <Screen active={isActive}>
      <div className="flex items-center justify-center h-full">
        <div className="bg-mova-surface w-[90%] max-w-[320px] p-8 rounded-ios-xl shadow-soft flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-mova-destructive/10 text-mova-destructive flex items-center justify-center mb-5">
            <ErrorIcon />
          </div>
          <h2 className="text-xl font-bold mb-2">{es.ACCESS_DENIED}</h2>
          <p className="text-sm text-mova-text-secondary mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={onRetry}
            className="w-full py-4 bg-mova-accent text-white font-semibold border-none rounded-ios-lg cursor-pointer shadow-button btn-diagonal-shine btn-hover-scale mb-3"
          >
            {es.RETRY_BTN}
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 bg-mova-secondary text-mova-accent font-semibold border-none rounded-ios-lg cursor-pointer btn-hover-scale hover:bg-mova-accent/10"
          >
            {es.BACK_HOME_BTN}
          </button>
        </div>
      </div>
    </Screen>
  );
}
