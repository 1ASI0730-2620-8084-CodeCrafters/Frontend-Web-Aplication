import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';

const BottleTrackPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#d9600a',
            700: '#b34900',
            800: '#803400',
            900: '#4f2000',
            950: '#2e1300'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.700}',
                    activeColor: '{primary.800}'
                },
                highlight: {
                    background: '{primary.100}',
                    focusBackground: '{primary.200}',
                    color: '{primary.900}',
                    focusColor: '{primary.900}'
                }
            }
        }
    }
});

export default BottleTrackPreset;
