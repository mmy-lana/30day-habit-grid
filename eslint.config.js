import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default withVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // `Heading` is an intentional single-word atomic primitive (see PLAN §8.1).
      'vue/multi-word-component-names': ['error', { ignores: ['Heading'] }],
    },
  },
  { ignores: ['dist', 'node_modules'] },
);