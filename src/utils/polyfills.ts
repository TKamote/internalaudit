import { Platform } from 'react-native';

console.log('Polyfills: Initializing...');

if (Platform.OS !== 'web') {
  // Polyfill TextDecoder for latin1 support
  if (typeof global.TextDecoder === 'function') {
    console.log('Polyfills: Patching TextDecoder...');
    const OriginalTextDecoder = global.TextDecoder;
    
    try {
      // @ts-ignore
      global.TextDecoder = class TextDecoder extends OriginalTextDecoder {
        private _label: string;

        constructor(label: string = 'utf-8', options?: any) {
          // Normalize label
          const normalizedLabel = label ? label.toLowerCase() : 'utf-8';
          const isLatin1 = normalizedLabel === 'latin1' || normalizedLabel === 'iso-8859-1';
          
          // Pass 'utf-8' to super if latin1 is requested to avoid RangeError
          super(isLatin1 ? 'utf-8' : label, options);
          
          this._label = normalizedLabel;
        }

        get encoding() {
          return this._label;
        }

        decode(input?: any, options?: any): string {
          if (this._label === 'latin1' || this._label === 'iso-8859-1') {
            if (!input) return '';
            
            let buffer: Uint8Array;
            if (input instanceof Uint8Array) {
              buffer = input;
            } else if (input && input.buffer instanceof ArrayBuffer) {
              buffer = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
            } else {
              try {
                  // Try to handle array-like objects
                  buffer = new Uint8Array(input as any);
              } catch (e) {
                  return '';
              }
            }

            let str = '';
            for (let i = 0; i < buffer.length; i++) {
              str += String.fromCharCode(buffer[i]);
            }
            return str;
          }
          return super.decode(input, options);
        }
      };
      console.log('Polyfills: TextDecoder patched successfully.');
    } catch (e) {
      console.error('Polyfills: Failed to patch TextDecoder:', e);
    }
  } else {
    console.log('Polyfills: TextDecoder not found, skipping patch.');
  }
}

console.log('Polyfills: Initialization complete.');
