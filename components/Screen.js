// react-native-safe-area-context's SafeAreaView with Nativewind className support
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';

cssInterop(SafeAreaView, { className: 'style' });
export default SafeAreaView;
